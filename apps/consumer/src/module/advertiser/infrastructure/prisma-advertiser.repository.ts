import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AdvertiserRepository } from '../domain';
import { Advertiser, PrismaService } from '@repo/prisma';

@Injectable()
export class PrismaAdvertiserRepository implements AdvertiserRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findByName(name: string): Promise<Advertiser | null> {
		try {
			return await this.prismaService.advertiser.findUnique({ where: { name: name } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async create(name: string): Promise<Advertiser> {
		try {
			return await this.prismaService.advertiser.create({ data: { name: name } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
