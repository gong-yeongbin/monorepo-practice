import { IsNumberString } from 'class-validator';

export class CampaignIdDto {
	@IsNumberString()
	id: string;
}
