// singular event 포스트백 쿼리를 표준 포스트백 필드로 변환하는 매퍼
import { Expose, Transform } from 'class-transformer';
import { normalizeViewCode } from '@common/utils/view-code.util';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export class SingularEvent {
	@Expose({ name: 'sub3' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	clickId: string;

	@Expose({ name: 'sub2' })
	@Transform(({ value }) => normalizeViewCode(Array.isArray(value) ? value[0] : value))
	viewCode: string;

	@Expose({ name: 'sub1' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	token: string;

	@Expose({ name: 'gaid' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ obj }) => obj.gaid || null)
	adid: string;

	@Expose()
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ obj }) => obj.idfa || obj.idfv || null)
	idfa: string;

	@Expose({ name: 'attribution_ip' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	ip: string;

	@Expose({ name: 'attribution_country' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	countryCode: string;

	// 이름과 달리 install_time·time이 문자열 표기고 install_utc·utc가 유닉스 초다
	@Expose({ name: 'install_utc' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs.unix(value).utcOffset(540).format(), { toClassOnly: true })
	installedAt: Date;

	@Expose({ name: 'utc' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs.unix(value).utcOffset(540).format(), { toClassOnly: true })
	eventedAt: Date;

	@Expose({ name: 'event_name' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	eventName: string;

	@Expose({ name: 'currency' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	revenueCurrency: string;

	@Expose({ name: 'amount' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	revenue: string;

	@Expose({ name: 'platform' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	os: string;

	@Expose({ name: 'os_version' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	osVersion: string;
}
