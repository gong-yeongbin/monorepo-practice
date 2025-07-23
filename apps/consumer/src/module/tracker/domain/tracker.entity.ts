import { tracker } from '@repo/prisma';

export class Tracker implements tracker {
	name: string;
	id: number;
	tracking_url: string;
	install_postback_url: string;
	event_postback_url: string;
}
