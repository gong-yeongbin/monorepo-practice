import { tracker } from '@prisma/client';

export class Tracker implements tracker {
	name: string;
	id: number;
	tracking_url: string;
	install_postback_url: string;
	event_postback_url: string;
}
