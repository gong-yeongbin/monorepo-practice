// Prisma로 daily_report 기반 대시보드 통계를 집계하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { DailyRow, DashboardRow, DetailRow } from '@dashboard/domain/statistics.entity';
import { DashboardRepository, DateRange } from '@dashboard/domain/dashboard.repository';

@Injectable()
export class PrismaDashboardRepository implements DashboardRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async dashboard(date: Date): Promise<DashboardRow[]> {
		// 특정 일자, advertising별 카운터 합산. daily_report → campaign(token) → advertising 조인.
		return this.prismaService.$queryRaw<DashboardRow[]>`
			SELECT a.id AS advertising_id, a.name AS advertising_name,
				CAST(SUM(d.click) AS SIGNED) AS click, CAST(SUM(d.install) AS SIGNED) AS install,
				CAST(SUM(d.registration) AS SIGNED) AS registration, CAST(SUM(d.retention) AS SIGNED) AS retention,
				CAST(SUM(d.purchase) AS SIGNED) AS purchase, CAST(SUM(d.revenue) AS SIGNED) AS revenue,
				CAST(SUM(d.etc1) AS SIGNED) AS etc1, CAST(SUM(d.etc2) AS SIGNED) AS etc2, CAST(SUM(d.etc3) AS SIGNED) AS etc3,
				CAST(SUM(d.etc4) AS SIGNED) AS etc4, CAST(SUM(d.etc5) AS SIGNED) AS etc5
			FROM daily_report d
			JOIN campaign c ON d.token = c.token
			JOIN advertising a ON a.id = c.advertising_id
			WHERE d.created_date = ${date}
			GROUP BY a.id, a.name`;
	}

	// 날짜별 카운터 합산. token이 주어지면 해당 캠페인으로 한정, 없으면 전체 합산.
	async daily(range: DateRange, token?: string): Promise<DailyRow[]> {
		const rows = await this.prismaService.daily_report.groupBy({
			by: ['created_date'],
			where: { ...(token && { token }), created_date: { gte: range.start_date, lte: range.end_date } },
			_sum: DAILY_SUM_SELECT,
			orderBy: { created_date: 'desc' },
		});

		return rows.map(mapDailyRow);
	}

	async detail(advertising_id: number, range: DateRange, media_id?: number): Promise<DetailRow[]> {
		// advertising별, 매체·캠페인 단위 합산. media_id가 주어지면 해당 매체로 한정.
		const mediaFilter = media_id !== undefined ? Prisma.sql`AND m.id = ${media_id}` : Prisma.empty;

		return this.prismaService.$queryRaw<DetailRow[]>`
			SELECT m.id AS media_id, m.name AS media_name, c.token AS token, c.id AS campaign_id,
				c.name AS campaign_name, c.type AS type, c.is_active AS is_active,
				CAST(SUM(d.click) AS SIGNED) AS click, CAST(SUM(d.install) AS SIGNED) AS install,
				CAST(SUM(d.registration) AS SIGNED) AS registration, CAST(SUM(d.retention) AS SIGNED) AS retention,
				CAST(SUM(d.purchase) AS SIGNED) AS purchase, CAST(SUM(d.revenue) AS SIGNED) AS revenue,
				CAST(SUM(d.etc1) AS SIGNED) AS etc1, CAST(SUM(d.etc2) AS SIGNED) AS etc2, CAST(SUM(d.etc3) AS SIGNED) AS etc3,
				CAST(SUM(d.etc4) AS SIGNED) AS etc4, CAST(SUM(d.etc5) AS SIGNED) AS etc5,
				CAST(SUM(d.unregistered) AS SIGNED) AS unregistered
			FROM daily_report d
			JOIN campaign c ON d.token = c.token
			JOIN media m ON m.id = c.media_id
			WHERE d.created_date >= ${range.start_date} AND d.created_date <= ${range.end_date}
				AND c.advertising_id = ${advertising_id} ${mediaFilter}
			GROUP BY m.id, m.name, c.token, c.id, c.name, c.type, c.is_active
			ORDER BY c.id DESC`;
	}
}

// daily_report groupBy에서 합산할 카운터 선택자
const DAILY_SUM_SELECT = {
	click: true, install: true, registration: true, retention: true, purchase: true, revenue: true,
	etc1: true, etc2: true, etc3: true, etc4: true, etc5: true, unregistered: true,
} as const;

// groupBy _sum 결과를 DailyRow로 매핑(null 합계는 0으로)
function mapDailyRow(row: { created_date: Date; _sum: Record<string, number | null> }): DailyRow {
	return {
		created_date: row.created_date,
		click: row._sum.click ?? 0,
		install: row._sum.install ?? 0,
		registration: row._sum.registration ?? 0,
		retention: row._sum.retention ?? 0,
		purchase: row._sum.purchase ?? 0,
		revenue: row._sum.revenue ?? 0,
		etc1: row._sum.etc1 ?? 0,
		etc2: row._sum.etc2 ?? 0,
		etc3: row._sum.etc3 ?? 0,
		etc4: row._sum.etc4 ?? 0,
		etc5: row._sum.etc5 ?? 0,
		unregistered: row._sum.unregistered ?? 0,
	};
}
