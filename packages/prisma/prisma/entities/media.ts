import { media } from '@prisma/client';

export class Media implements media {
	id: number;
	name: string;
	install_postback_url: string;
	event_postback_url: string;
}
