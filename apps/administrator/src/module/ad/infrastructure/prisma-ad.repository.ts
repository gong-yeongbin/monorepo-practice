import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Advertising, PrismaService } from '@repo/prisma';
import { AdRepository } from '@module/ad/domain';
import { AdDto } from '@module/ad/shared/dto';

@Injectable()
export class PrismaAdRepository implements AdRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findById(id: number): Promise<Advertising | null> {
		try {
			return await this.prismaService.advertising.findUnique({ where: { id: id } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async findByName(name: string): Promise<Advertising | null> {
		try {
			return await this.prismaService.advertising.findUnique({ where: { name: name } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async create(ad: AdDto): Promise<Advertising> {
		try {
			return await this.prismaService.advertising.create({ data: ad });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async update(id: number, ad: AdDto): Promise<Advertising> {
		try {
			return await this.prismaService.advertising.update({ where: { id: id }, data: { name: ad.name, image: ad.image } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
