import { IsString } from 'class-validator';

export class CreateTrackerDto {
	@IsString()
	name: string;

	@IsString()
	tracking_url: string;

	@IsString()
	install_postback_url: string;

	@IsString()
	event_postback_url: string;
}
