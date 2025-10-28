import { advertising } from '@repo/prisma';

export class Advertising implements advertising {
	id: number;
	name: string;
	image: string | null;
	advertiser_name: string;
	tracker_name: string;
}
