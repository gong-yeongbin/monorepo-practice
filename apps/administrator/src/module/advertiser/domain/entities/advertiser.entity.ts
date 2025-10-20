import { advertiser } from '@repo/prisma';

export class Advertiser implements advertiser {
	id: number;
	name: string;
}
