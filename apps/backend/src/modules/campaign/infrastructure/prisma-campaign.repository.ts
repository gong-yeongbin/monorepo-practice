// Prisma로 campaign·campaign_config를 조회·변경하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Campaign, CampaignConfig } from '@campaign/domain/campaign.entity';
import { AdvertisingTrackerInfo, CampaignRepository, CreateCampaignProps, UpsertConfigProps } from '@campaign/domain/campaign.repository';

@Injectable()
export class PrismaCampaignRepository implements CampaignRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findById(id: number): Promise<Campaign | null> {
		return this.prismaService.campaign.findUnique({ where: { id } });
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

	async setActive(id: number, is_active: boolean): Promise<void> {
		await this.prismaService.campaign.update({ where: { id }, data: { is_active } });
	}

	async findConfigs(campaign_id: number): Promise<CampaignConfig[]> {
		return this.prismaService.campaign_config.findMany({ where: { campaign_id } });
	}

	async replaceConfigs(campaign_id: number, configs: UpsertConfigProps[]): Promise<void> {
		await this.prismaService.$transaction([
			this.prismaService.campaign_config.deleteMany({ where: { campaign_id } }),
			this.prismaService.campaign_config.createMany({ data: configs.map((config) => ({ ...config, campaign_id })) }),
		]);
	}
}
