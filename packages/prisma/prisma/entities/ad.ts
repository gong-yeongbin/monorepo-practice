import { ad } from '@prisma/client';

export class Ad implements ad {
	id: number;
	name: string;
	image: string | null;
	advertiser_name: string;
}
