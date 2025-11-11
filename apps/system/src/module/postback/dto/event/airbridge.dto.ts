import { Expose, Transform } from 'class-transformer';
import * as dayjs from 'dayjs';

export class Airbridge {
	@Expose({ name: 'click_id' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	clickId: string;

	@Expose({ name: 'sub_id' })
	@Transform(({ value }) => (Array.isArray(value) ? encodeURIComponent(value[0]) : encodeURIComponent(value)))
	viewCode: string;

	@Expose({ name: 'custom_param1' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	token: string;

	@Expose({ name: 'google_aid' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ obj }) => obj.google_aid || null)
	adid: string;

	@Expose()
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ obj }) => obj.ios_idfa || obj.ios_ifv || null)
	idfa: string;

	@Expose({ name: 'device_ip' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	ip: string;

	@Expose({ name: 'country' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	countryCode: string;

	@Expose({ name: 'install_timestamp' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs.unix(value / 1000).toDate())
	installedAt: Date;

	@Expose({ name: 'event_timestamp' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs.unix(value / 1000).toDate())
	eventedAt: Date;

	@Expose()
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	eventName: string;

	@Expose({ name: 'product_info' })
	@Transform(({ value }) => {
		try {
			const arr = JSON.parse(value);
			return arr[0]?.currency;
		} catch {
			return null;
		}
	})
	revenueCurrency: string;

	@Expose({ name: 'eventValue' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	revenue: string;
}
