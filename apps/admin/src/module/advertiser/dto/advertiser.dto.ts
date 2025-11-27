import { Expose } from 'class-transformer';

export class AdvertiserDto {
	@Expose()
	id: number;

	@Expose()
	name: string;
}
