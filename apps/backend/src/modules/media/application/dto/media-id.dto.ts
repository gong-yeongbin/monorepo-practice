import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class MediaIdDto {
	@Type(() => Number)
	@IsInt()
	id: number;
}
