import { Expose } from 'class-transformer';
import { CampaignDto } from '@advertising/dto/campaign.dto';

export class ResponseGetAdvertisingDto {
	@Expose()
	id: number;

	@Expose()
	name: string;

	@Expose()
	image: string;

	@Expose({ name: 'advertiser_name' })
	advertiserName: string;

	@Expose({ name: 'tracker_name' })
	trackerName: string;

	@Expose()
	campaign: CampaignDto[];
}
