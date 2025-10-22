import { Advertising } from '@repo/prisma';
import { AdvertisingDto } from '@module/advertising/dto/advertising.dto';

export interface IAdvertising {
	findById(id: number): Promise<Advertising | null>;
	findByName(name: string): Promise<Advertising | null>;
	create(advertising: AdvertisingDto): Promise<Advertising>;
	update(id: number, advertising: AdvertisingDto): Promise<Advertising>;
}
