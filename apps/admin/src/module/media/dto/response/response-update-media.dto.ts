import { Expose } from 'class-transformer';

export class ResponseUpdateMediaDto {
	@Expose()
	id: number;

	@Expose()
	name: string;

	@Expose({ name: 'install_postback_url' })
	installPostbackUrl: string;

	@Expose({ name: 'event_postback_url' })
	eventPostbackUrl: string;
}
