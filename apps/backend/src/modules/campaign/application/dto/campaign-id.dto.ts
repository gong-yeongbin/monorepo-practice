import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CampaignIdDto {
	@Type(() => Number)
	@IsInt()
	id: number;
}
