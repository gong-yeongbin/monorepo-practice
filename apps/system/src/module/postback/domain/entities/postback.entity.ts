import { postback } from '@repo/prisma';

export class Postback implements postback {
	id: number;
	tracker_name: string;
	event_name: string;
	click_id: string;
	pub_id: string | null;
	sub_id: string | null;
	view_code: string;
	token: string;
	adid: string | null;
	idfa: string | null;
	ip: string;
	country_code: string | null;
	clicked_at: Date | null;
	installed_at: Date | null;
	evented_at: Date | null;
	media_sent_at: Date | null;
	revenue_currency: string | null;
	revenue: string | null;
	raw_query_params: string;
}
