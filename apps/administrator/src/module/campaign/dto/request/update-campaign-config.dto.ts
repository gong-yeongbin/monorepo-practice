import { IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCampaignConfigDto {
	@IsBoolean()
	sendMedia: boolean;

	@IsString()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	trackerEventName: string;

	@IsString()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	adminEventName: string;

	@IsString()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	mediaEventName: string;
}
