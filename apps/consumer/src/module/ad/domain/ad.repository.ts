import { Ad } from '@repo/prisma';
import { AdDto } from '../shared/dto';

export abstract class AdRepository {
	abstract findByName(name: string): Promise<Ad | null>;
	abstract create(ad: AdDto): Promise<Ad>;
}
