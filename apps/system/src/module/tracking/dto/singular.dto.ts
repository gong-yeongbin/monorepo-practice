import { Expose } from 'class-transformer';

export class Singular {
	@Expose()
	idfa: string;

	@Expose({ name: 'adid' })
	gaid: string;

	@Expose()
	campaignName: string;

	@Expose()
	campaignId: string;

	@Expose({ name: 'clickId' })
	click_id: string;

	@Expose()
	token: string;

	@Expose({ name: 'viewCode' })
	view_code: string;

	@Expose({ name: 'viewCode' })
	psid: string;

	@Expose({ name: 'clickId' })
	sub3: string;

	@Expose()
	sub4: string;

	@Expose()
	sub5: string;
}
