import { CampaignDto } from '@module/campaign/dto/campaign.dto';
import { Campaign } from '@module/campaign/domain/entities';

export interface ICampaign {
	find(id: number): Promise<Campaign | null>;
	findMany(): Promise<Campaign[]>;
	findManyByAdvertising(advertisingName: string): Promise<Campaign[]>;
	create(campaign: CampaignDto): Promise<Campaign>;
}
