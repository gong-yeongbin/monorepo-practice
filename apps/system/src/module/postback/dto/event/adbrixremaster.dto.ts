import { Expose, Transform } from 'class-transformer';
import * as dayjs from 'dayjs';

export class Adbrixremaster {
	@Expose({ name: 'cb_3' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	clickId: string;

	@Expose({ name: 'cb_2' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	viewCode: string;

	@Expose({ name: 'cb_1' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	token: string;

	@Expose()
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ obj }) => obj.adid || null)
	adid: string;

	@Expose({ name: 'idfv' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ obj }) => obj.idfv || null)
	idfa: string;

	@Expose({ name: 'a_ip' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	ip: string;

	@Expose({ name: 'device_country' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	countryCode: string;

	@Expose({ name: 'event_datetime' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs(value).add(9, 'hour').toDate())
	installDateTime: Date;

	@Expose({ name: 'event_datetime' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs(value).add(9, 'hour').toDate())
	eventDateTime: Date;

	@Expose({ name: 'event_name' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	eventName: string;

	@Expose()
	@Transform(({ obj }) => {
		if (obj?.param_json) {
			const paramJson = JSON.parse(obj.param_json);
			if (paramJson['abx:item.abx:sales']) {
				return paramJson['abx:item.abx:currency'];
			} else if (paramJson['abx:items']) {
				return paramJson['abx:items'][0]['abx:currency'];
			}
			return null;
		}
	})
	revenueCurrency: string;

	@Expose()
	@Transform(({ obj }) => {
		if (obj?.param_json) {
			const paramJson = JSON.parse(obj.param_json);
			if (paramJson['abx:item.abx:sales']) {
				return paramJson['abx:item.abx:sales'];
			} else if (paramJson['abx:items']) {
				return paramJson['abx:items'].reduce((acc, curr) => (acc += parseInt(curr['abx:sales']) || 0), 0);
			}
			return null;
		}
	})
	revenue: string;
}
