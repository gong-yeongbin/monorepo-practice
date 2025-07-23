import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTrackerDto {
	@IsString()
	@Transform(({ value }) => value.trim())
	name: string;

	@IsString()
	@Transform(({ value }) => value.trim())
	tracking_url: string;

	@IsString()
	@Transform(({ value }) => value.trim())
	install_postback_url: string;

	@IsString()
	@Transform(({ value }) => value.trim())
	event_postback_url: string;
}
