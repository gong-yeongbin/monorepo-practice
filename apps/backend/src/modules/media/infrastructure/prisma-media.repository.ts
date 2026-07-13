// Prisma로 media를 조회·생성·수정·삭제하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Media, MediaWithCampaignCount } from '@media/domain/media.entity';
import { CreateMediaProps, MediaRepository, UpdateMediaProps } from '@media/domain/media.repository';

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

	async findById(id: number): Promise<Media | null> {
		return this.prismaService.media.findUnique({ where: { id } });
	}

	async findByName(name: string): Promise<Media | null> {
		return this.prismaService.media.findUnique({ where: { name } });
	}

	async create(props: CreateMediaProps): Promise<Media> {
		return this.prismaService.media.create({ data: props });
	}

	async update(id: number, props: UpdateMediaProps): Promise<Media> {
		return this.prismaService.media.update({ where: { id }, data: props });
	}

	async delete(id: number): Promise<void> {
		await this.prismaService.media.delete({ where: { id } });
	}

	async countCampaign(media_id: number): Promise<number> {
		return this.prismaService.campaign.count({ where: { media_id } });
	}
}
