import { CreateAdvertisingDto, UpdateAdvertisingDto } from '@advertising/dto';
import { Advertising } from '@advertising/domain/entities';
import { Campaign } from '@campaign/domain/entities';

export interface IAdvertising {
	findById(id: number): Promise<Advertising | null>;
	findByName(name: string): Promise<Advertising | null>;
	findManyCampaign(id: number): Promise<Campaign[]>;
	findMany(): Promise<Advertising[]>;
	create(advertising: CreateAdvertisingDto): Promise<Advertising>;
	update(advertising: UpdateAdvertisingDto): Promise<Advertising>;
}
