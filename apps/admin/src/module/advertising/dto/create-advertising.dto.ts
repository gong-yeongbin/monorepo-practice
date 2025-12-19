import { Expose } from 'class-transformer';

export class CreateAdvertisingDto {
	@Expose()
	name: string;

	@Expose()
	image?: string;

	@Expose({ name: 'advertiserName' })
	advertiser_name: string;

	@Expose({ name: 'trackerName' })
	tracker_name: string;
}
