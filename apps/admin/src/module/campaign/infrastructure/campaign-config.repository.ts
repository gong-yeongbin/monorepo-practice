import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@repo/prisma';
import { ICampaignConfig } from '@campaign/domain/repositories';
import { CampaignConfig } from '@campaign/domain/entities';
import { UpsertCampaignConfigDto } from '@campaign/dto';

@Injectable()
export class CampaignConfigRepository implements ICampaignConfig {
	constructor(private readonly prismaService: PrismaService) {}

	async findMany(campaignId: number): Promise<CampaignConfig[]> {
		try {
			return await this.prismaService.campaign_config.findMany({ where: { campaign_id: campaignId } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async upsert(campaignConfig: UpsertCampaignConfigDto): Promise<CampaignConfig> {
		try {
			const { campaign_id, send_media, tracker_event_name, admin_event_name, media_event_name } = campaignConfig;
			return await this.prismaService.campaign_config.upsert({
				where: { campaign_id_admin_event_name: { campaign_id, admin_event_name } },
				create: { campaign_id, send_media, tracker_event_name, admin_event_name, media_event_name },
				update: { send_media, tracker_event_name, admin_event_name, media_event_name },
			});
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
