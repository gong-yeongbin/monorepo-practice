import { Expose } from 'class-transformer';

export class PostbackDto {
	@Expose()
	tracker: string;

	@Expose()
	eventName: string;

	@Expose()
	clickId: string;

	@Expose()
	pubId: string | null = null;

	@Expose()
	subId: string | null = null;

	@Expose()
	viewCode: string;

	@Expose()
	token: string;

	@Expose()
	adid: string | null = null;

	@Expose()
	idfa: string | null = null;

	@Expose()
	ip: string;

	@Expose()
	countryCode: string;

	@Expose()
	clickDateTime: Date;

	@Expose()
	installDateTime: Date;

	@Expose()
	eventDateTime: Date;

	@Expose()
	revenueCurrency: string;

	@Expose()
	revenue: string;

	@Expose()
	query: string;
}
