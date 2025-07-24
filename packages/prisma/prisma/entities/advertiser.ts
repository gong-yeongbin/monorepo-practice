import { advertiser } from '@prisma/client';

export class Advertiser implements advertiser {
	id: number;
	name: string;
}
