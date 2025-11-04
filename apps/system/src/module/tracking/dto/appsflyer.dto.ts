import { Expose } from 'class-transformer';

export class Appsflyer {
	@Expose({ name: 'clickId' })
	clickid: string;

	@Expose({ name: 'token' })
	af_c_id: string;

	@Expose({ name: 'adid' })
	advertising_id: string;

	@Expose()
	idfa: string;

	@Expose({ name: 'viewCode' })
	af_siteid: string;

	@Expose()
	af_adset_id: string;

	@Expose()
	af_ad_id: string;

	@Expose()
	af_ip: string;

	@Expose()
	af_ua: string;

	@Expose()
	af_lang: string;
}
