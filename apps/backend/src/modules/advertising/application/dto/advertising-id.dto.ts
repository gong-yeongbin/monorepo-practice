import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AdvertisingIdDto {
	@ApiProperty({ description: '광고 id', example: 1 })
	@Type(() => Number)
	@IsInt()
	id: number;
}
