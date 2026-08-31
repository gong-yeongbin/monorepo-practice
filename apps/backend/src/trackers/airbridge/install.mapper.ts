import { Expose, Transform } from 'class-transformer';
import dayjs from 'dayjs';

export class AirbridgeInstall {
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

	@Expose({ name: 'click_timestamp' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs.unix(value / 1000).toDate())
	clickedAt: Date;

	@Expose({ name: 'install_timestamp' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs.unix(value / 1000).toDate())
	installedAt: Date;

	@Expose({ name: 'device_model' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	deviceModel: string;

	@Expose({ name: 'device_manufacturer' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	deviceManufacturer: string;

	@Expose({ name: 'device_type' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	deviceType: string;

	@Expose({ name: 'os' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	os: string;

	@Expose({ name: 'os_version' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	osVersion: string;

	@Expose({ name: 'device_carrier' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	carrier: string;
}
