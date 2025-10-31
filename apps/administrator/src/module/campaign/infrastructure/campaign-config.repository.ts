import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ICampaignConfig } from '@module/campaign/domain/repositories';
import { PrismaService } from '@repo/prisma';
import { CampaignConfig } from '../domain/entities';
import { CampaignConfigDto } from '../dto/campaign-config.dto';

@Injectable()
export class CampaignConfigRepository implements ICampaignConfig {
	constructor(private readonly prismaService: PrismaService) {}

	async upsert(token: string, campaignConfig: CampaignConfigDto): Promise<CampaignConfig> {
		try {
			const { send_media, tracker_event_name, admin_event_name, media_event_name } = campaignConfig;
			return await this.prismaService.campaign_config.upsert({
				where: { token_admin_event_name: { token, admin_event_name } },
				create: { token, send_media, tracker_event_name, admin_event_name, media_event_name },
				update: { send_media, tracker_event_name, media_event_name },
			});
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
