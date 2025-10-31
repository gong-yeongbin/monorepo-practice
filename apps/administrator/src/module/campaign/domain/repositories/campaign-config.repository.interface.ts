import { CampaignConfig } from '@module/campaign/domain/entities';
import { CampaignConfigDto } from '@module/campaign/dto/campaign-config.dto';

export interface ICampaignConfig {
	upsert(token: string, campaignConfig: CampaignConfigDto): Promise<CampaignConfig>;
}
