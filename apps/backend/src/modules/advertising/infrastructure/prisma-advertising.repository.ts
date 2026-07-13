// Prisma로 advertising CRUD를 처리하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Advertising, AdvertisingInfo, AdvertisingListItem } from '@advertising/domain/advertising.entity';
import { AdvertisingRepository, CreateAdvertisingProps, ListAdvertisingParams, UpdateAdvertisingProps } from '@advertising/domain/advertising.repository';

@Injectable()
export class PrismaAdvertisingRepository implements AdvertisingRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async exists(id: number): Promise<boolean> {
		return (await this.prismaService.advertising.findUnique({ where: { id } })) !== null;
	}

	async trackerExists(tracker_id: number): Promise<boolean> {
		return (await this.prismaService.tracker.findUnique({ where: { id: tracker_id } })) !== null;
	}

	async advertiserExists(advertiser_id: number): Promise<boolean> {
		return (await this.prismaService.advertiser.findUnique({ where: { id: advertiser_id } })) !== null;
	}

	async findByName(name: string): Promise<Advertising | null> {
		return this.prismaService.advertising.findUnique({ where: { name } });
	}

	async create(props: CreateAdvertisingProps): Promise<Advertising> {
		return this.prismaService.advertising.create({ data: props });
	}

	async update(id: number, props: UpdateAdvertisingProps): Promise<Advertising> {
		return this.prismaService.advertising.update({ where: { id }, data: props });
	}

	async delete(id: number): Promise<void> {
		await this.prismaService.advertising.delete({ where: { id } });
	}

	async list(params: ListAdvertisingParams): Promise<AdvertisingListItem[]> {
		// 이름 검색 + 페이징. tracker명을 함께 싣고, 각 advertising의 활성 campaign 개수를 세어 1개 이상이면 status=true(파생).
		const rows = await this.prismaService.advertising.findMany({
			where: { name: { contains: params.search } },
			orderBy: { id: 'desc' },
			skip: params.offset,
			take: params.limit,
			include: {
				tracker: { select: { name: true } },
				_count: { select: { campaign: { where: { is_active: true } } } },
			},
		});

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			image: row.image,
			advertiser_id: row.advertiser_id,
			tracker_id: row.tracker_id,
			tracker: row.tracker.name,
			campaign: row._count.campaign,
			status: row._count.campaign > 0,
		}));
	}

	async get(id: number): Promise<AdvertisingInfo | null> {
		const row = await this.prismaService.advertising.findUnique({
			where: { id },
			include: {
				advertiser: { select: { name: true } },
				tracker: { select: { name: true } },
				campaign: { include: { media: { select: { name: true } } } },
			},
		});
		if (!row) {
			return null;
		}

		// 연결된 media 이름을 중복 없이 모은다
		const media = [...new Set(row.campaign.map((campaign) => campaign.media.name))];
		return { advertiser: row.advertiser.name, tracker: row.tracker.name, advertising: row.name, image: row.image, media };
	}

	async countCampaign(advertising_id: number): Promise<number> {
		return this.prismaService.campaign.count({ where: { advertising_id } });
	}
}
