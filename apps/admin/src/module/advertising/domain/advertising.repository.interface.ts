import { AdvertisingDto } from '@module/advertising/dto/advertising.dto';
import { Advertising } from '@module/advertising/domain/advertising.entity';

export interface IAdvertising {
	findById(id: number): Promise<Advertising | null>;
	findByName(name: string): Promise<Advertising | null>;
	findMany(): Promise<Advertising[] | null>;
	findManyCampaign(id: number): Promise<Advertising | null>;
	create(advertising: AdvertisingDto): Promise<Advertising>;
	update(id: number, advertising: AdvertisingDto): Promise<Advertising>;
}
