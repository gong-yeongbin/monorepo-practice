import { CreateCampaignDto, UpdateCampaignDto } from '@campaign/dto';
import { Campaign } from '@campaign/domain/entities';

export interface ICampaign {
	find(id: number): Promise<Campaign | null>;
	findMany(id: number): Promise<Campaign[]>;
	create(campaign: CreateCampaignDto): Promise<Campaign>;
	update(campaign: UpdateCampaignDto): Promise<Campaign>;
}
