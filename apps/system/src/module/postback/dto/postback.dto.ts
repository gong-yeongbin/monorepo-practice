import { Expose } from 'class-transformer';

export class PostbackDto {
	@Expose({ name: 'trackerName' })
	tracker_name: string;

	@Expose({ name: 'eventName' })
	event_name: string;

	@Expose({ name: 'clickId' })
	click_id: string;

	@Expose({ name: 'pubId' })
	pub_id: string | null = null;

	@Expose({ name: 'subId' })
	sub_id: string | null = null;

	@Expose({ name: 'viewCode' })
	view_code: string;

	@Expose({ name: 'token' })
	token: string;

	@Expose({ name: 'adid' })
	adid: string | null = null;

	@Expose({ name: 'idfa' })
	idfa: string | null = null;

	@Expose({ name: 'ip' })
	ip: string;

	@Expose({ name: 'countryCode' })
	country_code: string;

	@Expose({ name: 'clickedAt' })
	clicked_at: Date | null = null;

	@Expose({ name: 'installedAt' })
	installed_at: Date | null = null;

	@Expose({ name: 'eventedAt' })
	evented_at: Date | null = null;

	@Expose({ name: 'revenueCurrency' })
	revenue_currency: string | null = null;

	@Expose({ name: 'revenue' })
	revenue: string | null = null;

	@Expose({ name: 'rawQueryParams' })
	raw_query_params: string;
}
