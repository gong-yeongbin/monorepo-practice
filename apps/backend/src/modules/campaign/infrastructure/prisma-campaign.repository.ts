// Prisma로 campaign을 조회·변경하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Campaign } from '@campaign/domain/campaign.entity';
import { AdvertisingTrackerInfo, CampaignListRow, CampaignRepository, CreateCampaignProps, UpdateCampaignProps } from '@campaign/domain/campaign.repository';

@Injectable()
export class PrismaCampaignRepository implements CampaignRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findById(id: number): Promise<Campaign | null> {
		return this.prismaService.campaign.findUnique({ where: { id } });
	}

	async findByAdvertisingId(advertising_id: number): Promise<CampaignListRow[]> {
		const rows = await this.prismaService.campaign.findMany({
			where: { advertising_id },
			orderBy: { id: 'desc' },
			include: { media: { select: { name: true } } },
		});

		return rows.map((row) => ({
			campaign_id: row.id,
			token: row.token,
			campaign_name: row.name,
			type: row.type,
			is_active: row.is_active,
			media_name: row.media.name,
		}));
	}

	async findAdvertisingTracker(advertising_id: number): Promise<AdvertisingTrackerInfo | null> {
		const advertising = await this.prismaService.advertising.findUnique({
			where: { id: advertising_id },
			include: { tracker: true },
		});
		if (!advertising) {
			return null;
		}

		return { tracker_name: advertising.tracker.name, tracker_tracking_url: advertising.tracker.tracking_url };
	}

	async mediaExists(media_id: number): Promise<boolean> {
		const media = await this.prismaService.media.findUnique({ where: { id: media_id } });
		return media !== null;
	}

	async create(props: CreateCampaignProps): Promise<Campaign> {
		// 신규 캠페인은 기본 이벤트 config 1개(스키마 기본값: admin/tracker/media_event_name='install')를 함께 만든다.
		return this.prismaService.campaign.create({
			data: { ...props, campaign_config: { create: {} } },
		});
	}

	async delete(id: number): Promise<void> {
		await this.prismaService.campaign.delete({ where: { id } });
	}

	async update(id: number, props: UpdateCampaignProps): Promise<Campaign> {
		return this.prismaService.campaign.update({ where: { id }, data: props });
	}
}
