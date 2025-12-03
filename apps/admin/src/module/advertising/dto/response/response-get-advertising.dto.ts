import { Expose, Type } from 'class-transformer';
import { CampaignDto } from '@advertising/dto/response/campaign.dto';
import { ValidateNested } from 'class-validator';

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
	@Type(() => CampaignDto)
	@ValidateNested({ each: true })
	campaign: CampaignDto[];
}
