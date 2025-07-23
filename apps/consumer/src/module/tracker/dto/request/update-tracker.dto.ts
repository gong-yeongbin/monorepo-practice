import { IsString } from 'class-validator';

export class UpdateTrackerDto {
	@IsString()
	name: string;

	@IsString()
	trackingUrl: string;

	@IsString()
	installPostbackUrl: string;

	@IsString()
	eventPostbackUrl: string;
}
