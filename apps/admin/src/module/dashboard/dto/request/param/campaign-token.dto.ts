import { IsString } from 'class-validator';

export class CampaignTokenDto {
	@IsString()
	token: string;
}
