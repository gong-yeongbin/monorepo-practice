// Prisma $queryRaw로 오늘자 daily_report를 advertising별로 집계하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { PartnerRow } from '@partner/domain/partner.entity';
import { PartnerRepository } from '@partner/domain/partner.repository';

@Injectable()
export class PrismaPartnerRepository implements PartnerRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async statsByMedia(media_id: number, date: Date): Promise<PartnerRow[]> {
		return this.prismaService.$queryRaw<PartnerRow[]>`
			SELECT a.id AS advertising_id, a.name AS advertising_name,
				CAST(SUM(d.click) AS SIGNED) AS click, CAST(SUM(d.install) AS SIGNED) AS install,
				CAST(SUM(d.registration) AS SIGNED) AS registration, CAST(SUM(d.retention) AS SIGNED) AS retention,
				CAST(SUM(d.purchase) AS SIGNED) AS purchase, CAST(SUM(d.revenue) AS SIGNED) AS revenue,
				CAST(SUM(d.etc1) AS SIGNED) AS etc1, CAST(SUM(d.etc2) AS SIGNED) AS etc2, CAST(SUM(d.etc3) AS SIGNED) AS etc3,
				CAST(SUM(d.etc4) AS SIGNED) AS etc4, CAST(SUM(d.etc5) AS SIGNED) AS etc5
			FROM daily_report d
			JOIN campaign c ON d.token = c.token
			JOIN advertising a ON a.id = c.advertising_id
			WHERE d.created_date = ${date} AND c.media_id = ${media_id}
			GROUP BY a.id, a.name`;
	}

	async statsByAdvertiser(advertiser_id: number, date: Date): Promise<PartnerRow[]> {
		return this.prismaService.$queryRaw<PartnerRow[]>`
			SELECT a.id AS advertising_id, a.name AS advertising_name,
				CAST(SUM(d.click) AS SIGNED) AS click, CAST(SUM(d.install) AS SIGNED) AS install,
				CAST(SUM(d.registration) AS SIGNED) AS registration, CAST(SUM(d.retention) AS SIGNED) AS retention,
				CAST(SUM(d.purchase) AS SIGNED) AS purchase, CAST(SUM(d.revenue) AS SIGNED) AS revenue,
				CAST(SUM(d.etc1) AS SIGNED) AS etc1, CAST(SUM(d.etc2) AS SIGNED) AS etc2, CAST(SUM(d.etc3) AS SIGNED) AS etc3,
				CAST(SUM(d.etc4) AS SIGNED) AS etc4, CAST(SUM(d.etc5) AS SIGNED) AS etc5
			FROM daily_report d
			JOIN campaign c ON d.token = c.token
			JOIN advertising a ON a.id = c.advertising_id
			WHERE d.created_date = ${date} AND a.advertiser_id = ${advertiser_id}
			GROUP BY a.id, a.name`;
	}
}
