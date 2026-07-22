// campaign 목록 조회 쿼리(advertising 단위 필터) DTO
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCampaignDto {
	@ApiProperty({ description: '조회할 advertising id', example: 1 })
	@Type(() => Number)
	@IsInt()
	advertisingId: number;
}
