import { media } from '@repo/prisma';

export class Media implements media {
	name: string;
	id: number;
	install_postback_url: string;
	event_postback_url: string;
}
