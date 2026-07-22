import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CampaignIdDto {
	@ApiProperty({ description: '캠페인 id', example: 1 })
	@Type(() => Number)
	@IsInt()
	id: number;
}
