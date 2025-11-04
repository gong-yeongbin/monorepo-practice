import { Campaign } from '@tracking/domain/entities';

export interface ICampaign {
	findByToken(token: string): Promise<Campaign | null>;
}
