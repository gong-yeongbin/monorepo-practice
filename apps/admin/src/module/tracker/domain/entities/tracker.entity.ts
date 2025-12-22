import { tracker } from '@repo/prisma';

export class Tracker implements tracker {
	id: number;
	name: string;
	tracking_url: string;
	install_postback_url: string;
	event_postback_url: string;
}
