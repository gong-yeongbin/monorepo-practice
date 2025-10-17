import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Ad, PrismaService } from '@repo/prisma';
import { AdRepository } from '@module/ad/domain';
import { AdDto } from '@module/ad/shared/dto';

@Injectable()
export class PrismaAdRepository implements AdRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findById(id: number): Promise<Ad | null> {
		try {
			return await this.prismaService.ad.findUnique({ where: { id: id } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async findByName(name: string): Promise<Ad | null> {
		try {
			return await this.prismaService.ad.findUnique({ where: { name: name } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async create(ad: AdDto): Promise<Ad> {
		try {
			return await this.prismaService.ad.create({ data: ad });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async update(id: number, ad: AdDto): Promise<Ad> {
		try {
			return await this.prismaService.ad.update({ where: { id: id }, data: { name: ad.name, image: ad.image } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
