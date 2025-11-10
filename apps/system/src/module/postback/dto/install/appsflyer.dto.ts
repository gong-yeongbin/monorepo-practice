import { Expose, Transform } from 'class-transformer';

export class Appsflyer {
	@Expose({ name: 'clickid' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	clickId: string;

	@Expose({ name: 'af_siteid' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
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

	@Expose({ name: 'click_time' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	clickedAt: Date;

	@Expose({ name: 'install_time' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	installedAt: Date;
}
