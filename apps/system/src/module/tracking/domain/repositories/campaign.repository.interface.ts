import { Campaign } from '@tracking/domain/entities';

export interface ICampaign {
	find(token: string): Promise<Campaign | null>;
}
