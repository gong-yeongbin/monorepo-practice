import { advertising } from '@prisma/client';

export class Advertising implements advertising {
	id: number;
	name: string;
	image: string | null;
	advertiser_name: string;
}
