import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignType } from '@campaign/domain/campaign.entity';

// advertising_id·tracker 파생 필드는 불변. 나머지만 선택적으로 부분 수정한다.
export class UpdateCampaignDto {
	@ApiPropertyOptional({ description: '캠페인 이름', example: '수정된 캠페인' })
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	name?: string;

	@ApiPropertyOptional({ description: '과금 방식', enum: ['CPI', 'CPA'], example: 'CPA' })
	@IsOptional()
	@IsEnum(['CPI', 'CPA'])
	type?: CampaignType;

	@ApiPropertyOptional({ description: '집행 media id', example: 2 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	media_id?: number;

	@ApiPropertyOptional({ description: '활성 여부', example: true })
	@IsOptional()
	@IsBoolean()
	is_active?: boolean;
}
