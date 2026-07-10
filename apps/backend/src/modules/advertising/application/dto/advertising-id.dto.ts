import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AdvertisingIdDto {
	@Type(() => Number)
	@IsInt()
	id: number;
}
