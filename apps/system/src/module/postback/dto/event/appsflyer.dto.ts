import { Expose, Transform } from 'class-transformer';
import * as dayjs from 'dayjs';

export class Appsflyer {
	@Expose({ name: 'clickid' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	clickId: string;

	@Expose({ name: 'af_siteid' })
	@Transform(({ value }) => (Array.isArray(value) ? encodeURIComponent(value[0]) : encodeURIComponent(value)))
	viewCode: string;

	@Expose({ name: 'af_c_id' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	token: string;

	@Expose({ name: 'advertising_id' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ obj }) => obj.advertising_id || null)
	adid: string;

	@Expose()
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ obj }) => obj.idfv || obj.idfa || null)
	idfa: string;

	@Expose({ name: 'device_ip' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	ip: string;

	@Expose({ name: 'country_code' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	countryCode: string;

	@Expose({ name: 'install_time' })
	@Transform(({ value }) => (Array.isArray(value) ? dayjs(value[0]).format() : dayjs(value).format()))
	installedAt: Date;

	@Expose({ name: 'event_time' })
	@Transform(({ value }) => (Array.isArray(value) ? dayjs(value[0]).format() : dayjs(value).format()))
	eventedAt: Date;

	@Expose({ name: 'event_name' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	eventName: string;

	@Expose({ name: 'event_revenue_currency' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	revenueCurrency: string;

	@Expose({ name: 'event_revenue' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	revenue: string;
}
