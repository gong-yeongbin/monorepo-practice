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
	click: number;

	@Expose()
	install: number;

	@Expose()
	registration: number;

	@Expose()
	retention: number;

	@Expose()
	purchase: number;

	@Expose()
	revenue: number;

	@Expose()
	etc1: number;

	@Expose()
	etc2: number;

	@Expose()
	etc3: number;

	@Expose()
	etc4: number;

	@Expose()
	etc5: number;

	@Expose()
	unregistered: number;

	@Expose({ name: 'createdAt' })
	created_at: Date;
}
