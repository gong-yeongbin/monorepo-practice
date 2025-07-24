import { Advertiser } from '@repo/prisma';

export abstract class AdvertiserRepository {
	abstract findById(id: number): Promise<Advertiser | null>;
	abstract findByName(name: string): Promise<Advertiser | null>;
	abstract create(name: string): Promise<Advertiser>;
	abstract update(id: number, name: string): Promise<Advertiser>;
}
