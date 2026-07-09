import { Campaign } from '@campaign/domain/campaign.entity';

export const CAMPAIGN_REPOSITORY = Symbol('CAMPAIGN_REPOSITORY');

export interface CampaignRepository {
	findByToken(token: string): Promise<Campaign | null>;
}
