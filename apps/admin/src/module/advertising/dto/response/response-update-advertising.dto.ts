import { Expose } from 'class-transformer';

export class ResponseUpdateAdvertisingDto {
	@Expose()
	id: number;

	@Expose()
	name: string;

	@Expose()
	image: string;

	@Expose({ name: 'advertiser_name' })
	advertiserName: string;
}
