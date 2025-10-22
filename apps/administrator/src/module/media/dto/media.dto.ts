import { Expose } from 'class-transformer';

export class MediaDto {
	@Expose()
	name: string;

	@Expose({ name: 'installPostbackUrl' })
	install_postback_url: string;

	@Expose({ name: 'eventPostbackUrl' })
	event_postback_url: string;
}
