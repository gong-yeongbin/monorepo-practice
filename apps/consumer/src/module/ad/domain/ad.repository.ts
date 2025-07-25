import { Ad } from '@repo/prisma';
import { AdDto } from '../shared/dto';

export abstract class AdRepository {
	abstract findById(id: number): Promise<Ad | null>;
	abstract findByName(name: string): Promise<Ad | null>;
	abstract create(ad: AdDto): Promise<Ad>;
	abstract update(id: number, ad: AdDto): Promise<Ad>;
}
