import { Expose } from 'class-transformer';

export class UpdateAdvertisingDto {
	@Expose()
	id: number;

	@Expose()
	name: string;

	@Expose()
	image?: string;

	@Expose()
	advertiser_name: string;

	@Expose()
	tracker_name: string;
}
