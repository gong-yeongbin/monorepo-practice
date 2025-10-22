import { Expose } from 'class-transformer';

export class ResponseCreateTrackerDto {
	@Expose()
	id: number;

	@Expose()
	name: string;

	@Expose({ name: 'tracking_url' })
	trackingUrl: string;

	@Expose({ name: 'install_postback_url' })
	installPostbackUrl: string;

	@Expose({ name: 'event_postback_url' })
	eventPostbackUrl: string;
}
