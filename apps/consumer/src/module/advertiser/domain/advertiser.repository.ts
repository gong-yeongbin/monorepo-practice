import { Advertiser } from '@repo/prisma';

export abstract class AdvertiserRepository {
	abstract findByName(name: string): Promise<Advertiser | null>;
	abstract create(name: string): Promise<Advertiser>;
}
