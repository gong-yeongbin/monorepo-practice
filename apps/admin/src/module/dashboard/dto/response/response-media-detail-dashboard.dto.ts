import { Expose, Transform } from 'class-transformer';

export class ResponseMediaDetailDashboardDto {
	@Expose()
	id: string;

	@Expose({ name: 'pub_id' })
	pubId: string;

	@Expose({ name: 'sub_id' })
	subId: string;

	@Expose({ name: 'view_code' })
	viewCode: string;

	@Expose()
	token: string;

	@Expose()
	@Transform(({ value }) => value ?? 0)
	click: number = 0;

	@Expose()
	@Transform(({ value }) => value ?? 0)
	install: number = 0;

	@Expose()
	@Transform(({ value }) => value ?? 0)
	registration: number = 0;

	@Expose()
	@Transform(({ value }) => value ?? 0)
	retention: number = 0;

	@Expose()
	@Transform(({ value }) => value ?? 0)
	purchase: number = 0;

	@Expose()
	@Transform(({ value }) => value ?? 0)
	revenue: number = 0;

	@Expose()
	@Transform(({ value }) => value ?? 0)
	etc1: number = 0;

	@Expose()
	@Transform(({ value }) => value ?? 0)
	etc2: number = 0;

	@Expose()
	@Transform(({ value }) => value ?? 0)
	etc3: number = 0;

	@Expose()
	@Transform(({ value }) => value ?? 0)
	etc4: number = 0;

	@Expose()
	@Transform(({ value }) => value ?? 0)
	etc5: number = 0;

	@Expose()
	@Transform(({ value }) => value ?? 0)
	unregistered: number = 0;

	@Expose()
	createdDate: Date;
}
