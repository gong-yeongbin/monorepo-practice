import { Expose } from 'class-transformer';

export class Airbridge {
	@Expose({ name: 'clickId' })
	click_id: string;

	@Expose({ name: 'viewCode' })
	publisher_id: string;

	@Expose()
	sub_id_1: string;

	@Expose({ name: 'adid' })
	gaid: string;

	@Expose()
	idfa: string;

	@Expose({ name: 'token' })
	custom_param1: string;

	@Expose()
	custom_param2: string;

	@Expose()
	custom_param3: string;

	@Expose()
	custom_param4: string;

	@Expose()
	custom_param5: string;
}
