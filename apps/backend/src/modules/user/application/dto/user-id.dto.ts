import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UserIdDto {
	@Type(() => Number)
	@IsInt()
	id: number;
}
