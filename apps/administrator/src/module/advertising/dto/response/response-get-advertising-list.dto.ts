import { Expose } from 'class-transformer';

export class ResponseGetAdvertisingListDto {
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
}
