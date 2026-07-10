import { Expose, Transform } from 'class-transformer';

export class AdbrixRemasterTracking {
	@Expose({ name: 'token' })
	cb_1: string;

	@Expose({ name: 'viewCode' })
	cb_2: string;

	@Expose({ name: 'clickId' })
	cb_3: string;

	@Expose()
	cb_4: string;

	@Expose({ name: 'uuid' })
	cb_5: string;

	@Expose({ name: 'viewCode' })
	m_publisher: string;

	@Expose()
	m_sub_publisher: string;

	@Expose()
	@Transform(({ obj }) => obj.adid || obj.idfa)
	m_adid: string;
}
