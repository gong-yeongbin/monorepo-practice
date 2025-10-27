import { IAdvertiser } from '@module/advertiser/domain/repositories';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@repo/prisma';
import { Advertiser } from '@module/advertiser/domain/entities';
import { AdvertiserDto } from '@module/advertiser/dto/advertiser.dto';

@Injectable()
export class AdvertiserRepository implements IAdvertiser {
	constructor(private readonly prismaService: PrismaService) {}

	async find(name: string): Promise<Advertiser | null> {
		try {
			return await this.prismaService.advertiser.findUnique({ where: { name } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async findMany(): Promise<Advertiser[]> {
		try {
			return await this.prismaService.advertiser.findMany({ orderBy: { name: 'asc' } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async create(name: string): Promise<Advertiser> {
		try {
			return await this.prismaService.advertiser.create({ data: { name } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async update(advertiser: AdvertiserDto): Promise<Advertiser> {
		try {
			const { id, name } = advertiser;
			return await this.prismaService.advertiser.update({ where: { id }, data: { name } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
