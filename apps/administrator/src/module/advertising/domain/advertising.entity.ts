import { advertising } from '@repo/prisma';
import { Campaign } from '@module/campaign/domain/entities';

export class Advertising implements advertising {
	id: number;
	name: string;
	image: string | null;
	advertiser_name: string;
	tracker_name: string;
	campaign?: Campaign[];
}
