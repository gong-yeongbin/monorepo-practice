import { Expose, Transform } from 'class-transformer';
import { normalizeViewCode } from '@common/utils/view-code.util';
import dayjs from 'dayjs';

export class AdbrixRemasterInstall {
	@Expose({ name: 'cb_3' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	clickId: string;

	@Expose({ name: 'cb_2' })
	@Transform(({ value }) => normalizeViewCode(Array.isArray(value) ? value[0] : value))
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

	@Expose({ name: 'a_server_datetime' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs(value).add(9, 'hour').format())
	clickedAt: Date;

	@Expose({ name: 'event_datetime' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs(value).add(9, 'hour').format())
	installedAt: Date;

	@Expose({ name: 'device_model' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	deviceModel: string;

	@Expose({ name: 'device_vendor' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	deviceManufacturer: string;

	// OS 이름 파라미터가 따로 없고 device_platform이 숫자 코드로 내려온다
	@Expose({ name: 'device_platform' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	os: string;

	@Expose({ name: 'device_os_version' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	osVersion: string;

	@Expose({ name: 'device_carrier' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	carrier: string;

	@Expose({ name: 'device_language' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	language: string;

	@Expose({ name: 'app_version' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	appVersion: string;
}
