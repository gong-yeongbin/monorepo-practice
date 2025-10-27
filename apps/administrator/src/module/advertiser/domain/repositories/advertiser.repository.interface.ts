import { Advertiser } from '@module/advertiser/domain/entities';
import { AdvertiserDto } from '@module/advertiser/dto/advertiser.dto';

export interface IAdvertiser {
	find(name: string): Promise<Advertiser | null>;
	findMany(): Promise<Advertiser[]>;
	create(name: string): Promise<Advertiser>;
	update(advertiser: AdvertiserDto): Promise<Advertiser>;
	delete(id: number): Promise<Advertiser>;
}
