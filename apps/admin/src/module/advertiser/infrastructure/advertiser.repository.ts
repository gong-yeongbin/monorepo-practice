import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@repo/prisma';
import { IAdvertiser } from '@advertiser/domain/repositories';
import { Advertiser } from '@advertiser/domain/entities';
import { CreateAdvertiserDto } from '@advertiser/dto';

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

	async findById(id: number): Promise<Advertiser | null> {
		try {
			return await this.prismaService.advertiser.findUnique({ where: { id } });
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

	async update(advertiser: CreateAdvertiserDto): Promise<Advertiser> {
		try {
			const { id, name } = advertiser;
			return await this.prismaService.advertiser.update({ where: { id }, data: { name } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async delete(id: number): Promise<Advertiser> {
		try {
			return await this.prismaService.advertiser.delete({ where: { id } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
