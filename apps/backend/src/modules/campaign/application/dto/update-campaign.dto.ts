import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignType } from '@campaign/domain/campaign.entity';

// advertising_id·tracker 파생 필드는 불변. 나머지만 선택적으로 부분 수정한다.
export class UpdateCampaignDto {
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	name?: string;

	@IsOptional()
	@IsEnum(['CPI', 'CPA'])
	type?: CampaignType;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	media_id?: number;

	@IsOptional()
	@IsBoolean()
	is_active?: boolean;
}
