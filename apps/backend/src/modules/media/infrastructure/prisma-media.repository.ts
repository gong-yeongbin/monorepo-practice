// Prisma로 media를 조회하고 연결된 campaign 개수를 함께 매핑하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { MediaWithCampaignCount } from '@media/domain/media.entity';
import { MediaRepository } from '@media/domain/media.repository';

@Injectable()
export class PrismaMediaRepository implements MediaRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findAllWithCampaignCount(): Promise<MediaWithCampaignCount[]> {
		const rows = await this.prismaService.media.findMany({
			include: { _count: { select: { campaign: true } } },
		});

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			install_postback_url: row.install_postback_url,
			event_postback_url: row.event_postback_url,
			campaign: row._count.campaign,
		}));
	}
}
