import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignType } from '@campaign/domain/campaign.entity';

export class CreateCampaignDto {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsEnum(['CPI', 'CPA'])
	type: CampaignType;

	@Type(() => Number)
	@IsInt()
	advertising_id: number;

	@Type(() => Number)
	@IsInt()
	media_id: number;
}
