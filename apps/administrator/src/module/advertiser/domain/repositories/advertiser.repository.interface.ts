import { Advertiser } from '@module/advertiser/domain/entities';
import { AdvertiserDto } from '@module/advertiser/dto/advertiser.dto';

export interface IAdvertiser {
	find(name: string): Promise<Advertiser | null>;
	create(advertiser: AdvertiserDto): Promise<Advertiser>;
}
