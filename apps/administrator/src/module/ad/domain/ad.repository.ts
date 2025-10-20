import { AdDto } from '@module/ad/shared/dto';
import { Advertising } from '@repo/prisma';

export abstract class AdRepository {
	abstract findById(id: number): Promise<Advertising | null>;
	abstract findByName(name: string): Promise<Advertising | null>;
	abstract create(ad: AdDto): Promise<Advertising>;
	abstract update(id: number, ad: AdDto): Promise<Advertising>;
}
