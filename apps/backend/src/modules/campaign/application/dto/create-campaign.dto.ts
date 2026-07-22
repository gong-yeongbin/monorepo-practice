import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignType } from '@campaign/domain/campaign.entity';

export class CreateCampaignDto {
	@ApiProperty({ description: '캠페인 이름', example: '테스트 캠페인' })
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({ description: '과금 방식', enum: ['CPI', 'CPA'], example: 'CPI' })
	@IsEnum(['CPI', 'CPA'])
	type: CampaignType;

	@ApiProperty({ description: '소속 advertising id', example: 1 })
	@Type(() => Number)
	@IsInt()
	advertising_id: number;

	@ApiProperty({ description: '집행 media id', example: 1 })
	@Type(() => Number)
	@IsInt()
	media_id: number;
}
