import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AdvertiserIdDto {
	@ApiProperty({ description: '광고주 id', example: 1 })
	@Type(() => Number)
	@IsInt()
	id: number;
}
