import { Expose } from 'class-transformer';

export class DailyStatisticDto {
	@Expose({ name: 'viewCode' })
	view_code: string;

	@Expose()
	token: string;

	@Expose({ name: 'pubId' })
	pub_id: string | null;

	@Expose({ name: 'subId' })
	sub_id: string | null;

	@Expose()
	click: number = 0;

	@Expose()
	install: number = 0;

	@Expose()
	registration: number = 0;

	@Expose()
	retention: number = 0;

	@Expose()
	purchase: number = 0;

	@Expose()
	revenue: number = 0;

	@Expose()
	etc1: number = 0;

	@Expose()
	etc2: number = 0;

	@Expose()
	etc3: number = 0;

	@Expose()
	etc4: number = 0;

	@Expose()
	etc5: number = 0;

	@Expose()
	unregistered: number = 0;

	@Expose()
	created_date: Date;
}
