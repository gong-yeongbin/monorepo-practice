// singular install 포스트백 쿼리를 표준 포스트백 필드로 변환하는 매퍼
import { Expose, Transform } from 'class-transformer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export class SingularInstall {
	@Expose({ name: 'sub3' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	clickId: string;

	@Expose({ name: 'sub2' })
	@Transform(({ value }) => (Array.isArray(value) ? encodeURIComponent(value[0]) : encodeURIComponent(value)))
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

	// 이름과 달리 time이 문자열 표기고 utc가 유닉스 초다 — 시각은 utc 쪽에서 읽는다
	@Expose({ name: 'click_utc' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs.unix(value).utcOffset(540).format(), { toClassOnly: true })
	clickedAt: Date;

	@Expose({ name: 'utc' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	@Transform(({ value }) => dayjs.unix(value).utcOffset(540).format(), { toClassOnly: true })
	installedAt: Date;

	@Expose({ name: 'platform' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	os: string;

	@Expose({ name: 'os_version' })
	@Transform(({ value }) => (Array.isArray(value) ? value[0] : value))
	osVersion: string;
}
