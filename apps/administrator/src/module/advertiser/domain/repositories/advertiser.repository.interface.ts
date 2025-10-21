import { Advertiser } from '@module/advertiser/domain/entities';
import { AdvertiserDto } from '@module/advertiser/dto/advertiser.dto';

export interface IAdvertiser {
	find(name: string): Promise<Advertiser | null>;
	findMany(): Promise<Advertiser[]>;
	create(advertiser: AdvertiserDto): Promise<Advertiser>;
}
