// Prisma로 daily_report 기반 대시보드 통계를 집계하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { DailyDetailRow, DailyRow, DashboardRow, DetailRow, ReportCounters } from '@dashboard/domain/statistics.entity';
import { CounterSort, DashboardRepository, DateRange } from '@dashboard/domain/dashboard.repository';

@Injectable()
export class PrismaDashboardRepository implements DashboardRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async dashboard(date: Date, advertising_ids?: number[]): Promise<DashboardRow[]> {
		// 허용 목록이 비면 볼 수 있는 광고가 없다. Prisma.join([])은 예외를 던지고 IN ()은 SQL 문법 오류라 쿼리 자체를 보내지 않는다.
		// undefined(면제)일 때는 undefined === 0이 false라 이 분기에 걸리지 않는다.
		if (advertising_ids?.length === 0) {
			return [];
		}
		const scopeFilter = advertising_ids ? Prisma.sql`AND a.id IN (${Prisma.join(advertising_ids)})` : Prisma.empty;

		// 특정 일자, advertising별 카운터 합산. daily_report → campaign(token) → advertising 조인.
		const rows = await this.prismaService.$queryRaw<DashboardRow[]>`
			SELECT a.id AS advertising_id, a.name AS advertising_name,
				CAST(SUM(d.click) AS BIGINT) AS click, CAST(SUM(d.install) AS BIGINT) AS install,
				CAST(SUM(d.registration) AS BIGINT) AS registration, CAST(SUM(d.retention) AS BIGINT) AS retention,
				CAST(SUM(d.purchase) AS BIGINT) AS purchase, CAST(SUM(d.revenue) AS BIGINT) AS revenue,
				CAST(SUM(d.etc1) AS BIGINT) AS etc1, CAST(SUM(d.etc2) AS BIGINT) AS etc2, CAST(SUM(d.etc3) AS BIGINT) AS etc3,
				CAST(SUM(d.etc4) AS BIGINT) AS etc4, CAST(SUM(d.etc5) AS BIGINT) AS etc5
			FROM daily_report d
			JOIN campaign c ON d.token = c.token
			JOIN advertising a ON a.id = c.advertising_id
			WHERE d.created_date = ${date} ${scopeFilter}
			GROUP BY a.id, a.name`;

		return rows.map(toNumberRow);
	}

	// 날짜별 카운터 합산. token이 주어지면 해당 캠페인으로 한정, 없으면 (스코프 안에서) 전체 합산.
	async daily(range: DateRange, token?: string, advertising_ids?: number[]): Promise<DailyRow[]> {
		const rows = await this.prismaService.daily_report.groupBy({
			by: ['created_date'],
			// daily_report의 FK는 campaign_id가 아니라 token이지만 relation 이름이 campaign이라 중첩 필터가 된다.
			// token을 생략해도 여기서 걸리므로 "token 없으면 전체 합산"이 허용 목록 밖으로 새지 않는다.
			// Prisma의 in: []은 IN ()을 만들지 않고 항상 거짓인 조건이 되어 0행을 반환한다(raw SQL과 달리 방어가 필요 없다).
			where: {
				...(token && { token }),
				...(advertising_ids && { campaign: { advertising_id: { in: advertising_ids } } }),
				created_date: { gte: range.start_date, lte: range.end_date },
			},
			_sum: DAILY_SUM_SELECT,
			orderBy: { created_date: 'desc' },
		});

		return rows.map(mapDailyRow);
	}

	// token 기준, view_code·pub_id·sub_id 단위 카운터 합산. 지정한 카운터 컬럼으로 정렬.
	async dailyDetail(range: DateRange, token: string, sort: CounterSort, advertising_ids?: number[]): Promise<DailyDetailRow[]> {
		const rows = await this.prismaService.daily_report.groupBy({
			by: ['view_code', 'pub_id', 'sub_id'],
			// 이 중첩 필터가 곧 token 소유권 검증이다 — 남의 token을 넣어도 campaign의 advertising이 스코프 밖이면 0행이다.
			where: {
				token,
				...(advertising_ids && { campaign: { advertising_id: { in: advertising_ids } } }),
				created_date: { gte: range.start_date, lte: range.end_date },
			},
			_sum: DAILY_SUM_SELECT,
			orderBy: { _sum: { [sort.field]: sort.order } },
		});

		return rows.map(mapDailyDetailRow);
	}

	async detail(advertising_id: number, range: DateRange, media_id?: number): Promise<DetailRow[]> {
		// advertising별, 매체·캠페인 단위 합산. media_id가 주어지면 해당 매체로 한정.
		const mediaFilter = media_id !== undefined ? Prisma.sql`AND m.id = ${media_id}` : Prisma.empty;

		const rows = await this.prismaService.$queryRaw<DetailRow[]>`
			SELECT m.id AS media_id, m.name AS media_name, c.token AS token, c.id AS campaign_id,
				c.name AS campaign_name, c.type AS type, c.is_active AS is_active,
				CAST(SUM(d.click) AS BIGINT) AS click, CAST(SUM(d.install) AS BIGINT) AS install,
				CAST(SUM(d.registration) AS BIGINT) AS registration, CAST(SUM(d.retention) AS BIGINT) AS retention,
				CAST(SUM(d.purchase) AS BIGINT) AS purchase, CAST(SUM(d.revenue) AS BIGINT) AS revenue,
				CAST(SUM(d.etc1) AS BIGINT) AS etc1, CAST(SUM(d.etc2) AS BIGINT) AS etc2, CAST(SUM(d.etc3) AS BIGINT) AS etc3,
				CAST(SUM(d.etc4) AS BIGINT) AS etc4, CAST(SUM(d.etc5) AS BIGINT) AS etc5,
				CAST(SUM(d.unregistered) AS BIGINT) AS unregistered
			FROM daily_report d
			JOIN campaign c ON d.token = c.token
			JOIN media m ON m.id = c.media_id
			WHERE d.created_date >= ${range.start_date} AND d.created_date <= ${range.end_date}
				AND c.advertising_id = ${advertising_id} ${mediaFilter}
			GROUP BY m.id, m.name, c.token, c.id, c.name, c.type, c.is_active
			ORDER BY c.id DESC`;

		return rows.map(toNumberRow);
	}
}

// raw 쿼리의 CAST(SUM ... AS BIGINT)는 BIGINT라 Prisma가 BigInt로 반환한다.
// BigInt는 JSON 직렬화가 불가능하므로 응답 전에 number로 변환한다.
function toNumberRow<T extends object>(row: T): T {
	const converted = { ...row } as Record<string, unknown>;
	for (const key of Object.keys(converted)) {
		if (typeof converted[key] === 'bigint') {
			converted[key] = Number(converted[key]);
		}
	}
	return converted as T;
}

// daily_report groupBy에서 합산할 카운터 선택자
const DAILY_SUM_SELECT = {
	click: true, install: true, registration: true, retention: true, purchase: true, revenue: true,
	etc1: true, etc2: true, etc3: true, etc4: true, etc5: true, unregistered: true,
} as const;

// groupBy _sum의 공통 카운터를 매핑(null 합계는 0으로)
function mapCounters(sum: Record<string, number | null>): ReportCounters {
	return {
		click: sum.click ?? 0,
		install: sum.install ?? 0,
		registration: sum.registration ?? 0,
		retention: sum.retention ?? 0,
		purchase: sum.purchase ?? 0,
		revenue: sum.revenue ?? 0,
		etc1: sum.etc1 ?? 0,
		etc2: sum.etc2 ?? 0,
		etc3: sum.etc3 ?? 0,
		etc4: sum.etc4 ?? 0,
		etc5: sum.etc5 ?? 0,
	};
}

// groupBy _sum 결과를 DailyRow로 매핑
function mapDailyRow(row: { created_date: Date; _sum: Record<string, number | null> }): DailyRow {
	return {
		created_date: row.created_date,
		...mapCounters(row._sum),
		unregistered: row._sum.unregistered ?? 0,
	};
}

// groupBy _sum 결과를 DailyDetailRow로 매핑
function mapDailyDetailRow(row: { view_code: string; pub_id: string | null; sub_id: string | null; _sum: Record<string, number | null> }): DailyDetailRow {
	return {
		view_code: row.view_code,
		pub_id: row.pub_id,
		sub_id: row.sub_id,
		...mapCounters(row._sum),
	};
}
