import { Advertiser } from '@advertiser/domain/entities';
import { CreateAdvertiserDto } from '@advertiser/dto';

export interface IAdvertiser {
	find(name: string): Promise<Advertiser | null>;
	findMany(): Promise<Advertiser[]>;
	create(name: string): Promise<Advertiser>;
	update(advertiser: CreateAdvertiserDto): Promise<Advertiser>;
	delete(id: number): Promise<Advertiser>;
}
