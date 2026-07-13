import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class TrackerIdDto {
	@Type(() => Number)
	@IsInt()
	id: number;
}
