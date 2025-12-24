import { CampaignConfig } from '@campaign/domain/entities';
import { UpsertCampaignConfigDto } from '@campaign/dto';

export interface ICampaignConfig {
	findMany(campaignId: number): Promise<CampaignConfig[]>;
	upsert(campaignConfig: UpsertCampaignConfigDto): Promise<CampaignConfig>;
}
