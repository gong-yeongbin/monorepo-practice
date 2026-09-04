import { Expose, Transform } from 'class-transformer';
import { normalizeViewCode } from '@common/utils/view-code.util';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export class AdjustInstall {
	@Expose({ name: 'click_id' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	clickId: string;

	@Expose({ name: 'publisher_id' })
	@Transform(({ value }) => normalizeViewCode(Array.isArray(value) ? value[0] : value))
	viewCode: string;

	@Expose({ name: 'cp_token' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	token: string;

	@Expose()
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ obj }) => obj.adid || null)
	adid: string;

	@Expose()
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ obj }) => obj.idfa || obj.idfv || null)
	idfa: string;

	@Expose({ name: 'ip_address' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	ip: string;

	@Expose({ name: 'country' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	countryCode: string;

	@Expose({ name: 'click_time' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs.unix(value).utcOffset(540).format(), { toClassOnly: true })
	clickedAt: Date;

	@Expose({ name: 'installed_at' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs.unix(value).utcOffset(540).format(), { toClassOnly: true })
	installedAt: Date;

	@Expose({ name: 'device_name' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	deviceModel: string;

	@Expose({ name: 'device_type' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	deviceType: string;

	@Expose({ name: 'os_name' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	os: string;

	@Expose({ name: 'os_version' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	osVersion: string;

	// 통신사 파라미터가 따로 없어 가장 가까운 isp를 쓴다
	@Expose({ name: 'isp' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	carrier: string;
}
