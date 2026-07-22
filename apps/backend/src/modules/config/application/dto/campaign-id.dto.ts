// config 조회·교체 대상 campaign을 식별하는 경로 파라미터 DTO
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CampaignIdDto {
	@ApiProperty({ description: '대상 캠페인 id', example: 1 })
	@Type(() => Number)
	@IsInt()
	campaignId: number;
}
