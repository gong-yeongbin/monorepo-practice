import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AdRepository } from '../domain';
import { Ad, PrismaService } from '@repo/prisma';
import { AdDto } from '../shared/dto';

@Injectable()
export class PrismaAdRepository implements AdRepository {
	constructor(private readonly prismaService: PrismaService) {}

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
}
