import { CampaignDto } from '@module/campaign/dto/campaign.dto';
import { Campaign } from '@module/campaign/domain/entities';

export interface ICampaign {
	create(campaign: CampaignDto): Promise<Campaign>;
}
