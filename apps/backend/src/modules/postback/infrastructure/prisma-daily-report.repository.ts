// Prisma raw query로 일별 리포트를 배치 upsert하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { DailyReport } from '@postback/domain/daily-report.entity';
import { DailyReportRepository } from '@postback/domain/daily-report.repository';

@Injectable()
export class PrismaDailyReportRepository implements DailyReportRepository {
	constructor(private readonly prismaService: PrismaService) {}

	// 배치 전체를 multi-row INSERT ... ON CONFLICT DO UPDATE(PostgreSQL) 한 문장으로 처리한다.
	// row 단위로 원자적이라 SELECT→INSERT 분기 레이스(P2002)가 없고, 문장이 실패하면 아무것도 반영되지 않아 배치 재전달이 안전하다.
	async upsertMany(dailyReports: DailyReport[]): Promise<void> {
		if (dailyReports.length === 0) return;

		// created_date는 드라이버의 타임존 변환을 피하려고 UTC 기준 'YYYY-MM-DD' 문자열로 바인딩한다(@db.Date 컬럼)
		const rows = dailyReports.map(
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
