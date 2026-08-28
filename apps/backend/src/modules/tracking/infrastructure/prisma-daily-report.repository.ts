// Prisma raw query로 일별 리포트를 배치 upsert하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { DailyReport } from '@tracking/domain/daily-report.entity';
import { DailyReportRepository } from '@tracking/domain/daily-report.repository';

@Injectable()
export class PrismaDailyReportRepository implements DailyReportRepository {
	constructor(private readonly prismaService: PrismaService) {}

	// 배치 전체를 multi-row INSERT ... ON CONFLICT DO UPDATE(PostgreSQL) 한 문장으로 처리한다.
	// row 단위로 원자적이라 SELECT→INSERT 분기 레이스(P2002)가 없고, 문장이 실패하면 아무것도 반영되지 않아 배치 재전달이 안전하다.
	async upsertMany(dailyReports: DailyReport[]): Promise<void> {
		if (dailyReports.length === 0) return;

		// 잠금 순서를 문장마다 동일하게 고정해 동시 upsert 간 데드락을 막는다.
		// PostgreSQL은 VALUES에 적힌 순서로 행 잠금을 잡으므로, 정렬이 없으면 메시지 도착 순서가
		// 다른 두 컨슈머가 겹치는 행을 역순으로 잠글 수 있다(postback 쪽 구현과 기준이 같아야 한다).
		const sorted = [...dailyReports].sort((a, b) => a.view_code.localeCompare(b.view_code) || +a.created_date - +b.created_date);

		// created_date는 드라이버의 타임존 변환을 피하려고 UTC 기준 'YYYY-MM-DD' 문자열로 바인딩한다(@db.Date 컬럼)
		const rows = sorted.map(
			(r) =>
				Prisma.sql`(${r.view_code}, ${r.token}, ${r.pub_id}, ${r.sub_id}, ${r.click}, ${r.install}, ${r.registration}, ${r.retention}, ${r.purchase}, ${r.revenue}, ${r.etc1}, ${r.etc2}, ${r.etc3}, ${r.etc4}, ${r.etc5}, ${r.unregistered}, ${r.created_date.toISOString().slice(0, 10)})`
		);

		await this.prismaService.$executeRaw(Prisma.sql`
			INSERT INTO daily_report
				(view_code, token, pub_id, sub_id, click, install, registration, retention, purchase, revenue, etc1, etc2, etc3, etc4, etc5, unregistered, created_date)
			VALUES ${Prisma.join(rows)}
			ON CONFLICT (view_code, created_date) DO UPDATE SET
				click = daily_report.click + EXCLUDED.click,
				install = daily_report.install + EXCLUDED.install,
				registration = daily_report.registration + EXCLUDED.registration,
				retention = daily_report.retention + EXCLUDED.retention,
				purchase = daily_report.purchase + EXCLUDED.purchase,
				revenue = daily_report.revenue + EXCLUDED.revenue,
				etc1 = daily_report.etc1 + EXCLUDED.etc1,
				etc2 = daily_report.etc2 + EXCLUDED.etc2,
				etc3 = daily_report.etc3 + EXCLUDED.etc3,
				etc4 = daily_report.etc4 + EXCLUDED.etc4,
				etc5 = daily_report.etc5 + EXCLUDED.etc5,
				unregistered = daily_report.unregistered + EXCLUDED.unregistered
		`);
	}
}
