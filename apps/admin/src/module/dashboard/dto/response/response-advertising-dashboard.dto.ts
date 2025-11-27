import { Expose, Transform } from 'class-transformer';

export class ResponseAdvertisingDashboardDto {
	@Expose({ name: 'name' })
	advertisingName: string;

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
}
