import { Expose, Transform } from 'class-transformer';
import * as dayjs from 'dayjs';

export class Adjust {
	@Expose({ name: 'click_id' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	clickId: string;

	@Expose({ name: 'publisher_id' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	viewCode: string;

	@Expose({ name: 'cp_token' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	token: string;

	@Expose()
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	adid: string;

	@Expose()
	@Transform(({ obj }) => obj.ios_idfa || obj.ios_ifv)
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	idfa: string;

	@Expose({ name: 'ip_address' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	ip: string;

	@Expose({ name: 'country' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	countryCode: string;

	@Expose({ name: 'click_time' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs.unix(value).toDate())
	clickDateTime: Date;

	@Expose({ name: 'installed_at' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs.unix(value).toDate())
	installDateTime: Date;
}
