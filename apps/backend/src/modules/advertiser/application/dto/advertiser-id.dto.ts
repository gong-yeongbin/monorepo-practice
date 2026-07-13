import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AdvertiserIdDto {
	@Type(() => Number)
	@IsInt()
	id: number;
}
