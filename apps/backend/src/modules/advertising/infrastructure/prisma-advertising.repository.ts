// Prisma로 advertising CRUD를 처리하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Advertising, AdvertisingBrief, AdvertisingInfo, AdvertisingListItem } from '@advertising/domain/advertising.entity';
import { AdvertisingRepository, CreateAdvertisingProps, ListAdvertisingParams } from '@advertising/domain/advertising.repository';

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

	async list(params: ListAdvertisingParams): Promise<AdvertisingListItem[]> {
		// 이름 검색 + 페이징. 각 advertising의 활성 campaign 개수를 세고, 1개 이상이면 status=true(파생).
		const rows = await this.prismaService.advertising.findMany({
			where: { name: { contains: params.search } },
			orderBy: { id: 'desc' },
			skip: params.offset,
			take: params.limit,
			include: { _count: { select: { campaign: { where: { is_active: true } } } } },
		});

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			image: row.image,
			advertiser_id: row.advertiser_id,
			tracker_id: row.tracker_id,
			campaign: row._count.campaign,
			status: row._count.campaign > 0,
		}));
	}

	async brief(): Promise<AdvertisingBrief[]> {
		const rows = await this.prismaService.advertising.findMany({ include: { tracker: { select: { name: true } } } });
		return rows.map((row) => ({ id: row.id, name: row.name, image: row.image, tracker: row.tracker.name }));
	}

	async info(id: number): Promise<AdvertisingInfo | null> {
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

	async deactivateCampaigns(advertising_id: number): Promise<void> {
		await this.prismaService.campaign.updateMany({ where: { advertising_id }, data: { is_active: false } });
	}
}
