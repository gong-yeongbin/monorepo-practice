import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListAdvertisingDto {
	@IsOptional()
	@IsString()
	search: string = '';

	@Type(() => Number)
	@IsInt()
	offset: number = 0;

	@Type(() => Number)
	@IsInt()
	limit: number = 20;
}
