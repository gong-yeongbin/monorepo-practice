import { advertising } from '@repo/prisma';
import { Tracker } from '@tracker/domain/entities';

export class Advertising implements advertising {
	id: number;
	name: string;
	image: string | null;
	advertiser_id: number;
	tracker_id: number;
	tracker?: Tracker;
}
