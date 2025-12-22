import { Expose } from 'class-transformer';

export class UpdateTrackerDto {
	@Expose()
	id: number;

	@Expose()
	name: string;

	@Expose({ name: 'trackingUrl' })
	tracking_url: string;

	@Expose({ name: 'installPostbackUrl' })
	install_postback_url: string;

	@Expose({ name: 'eventPostbackUrl' })
	event_postback_url: string;
}
