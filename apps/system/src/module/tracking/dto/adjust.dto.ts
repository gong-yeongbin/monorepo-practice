import { Expose } from 'class-transformer';

export class Adjust {
	@Expose()
	adid: string;

	@Expose()
	idfa: string;

	@Expose({ name: 'viewCode' })
	publisher_id: string;

	@Expose({ name: 'token' })
	cp_token: string;

	@Expose({ name: 'clickId' })
	click_id: string;

	@Expose()
	uid: string;
}
