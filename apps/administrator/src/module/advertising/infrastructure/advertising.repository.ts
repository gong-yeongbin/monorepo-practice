import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@repo/prisma';
import { Advertising, IAdvertising } from '@module/advertising/domain';
import { AdvertisingDto } from '@module/advertising/dto/advertising.dto';

@Injectable()
export class AdvertisingRepository implements IAdvertising {
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

	async findMany(): Promise<Advertising[]> {
		try {
			return await this.prismaService.advertising.findMany({ orderBy: { id: 'desc' } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async create(advertising: AdvertisingDto): Promise<Advertising> {
		try {
			return await this.prismaService.advertising.create({ data: advertising });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async update(id: number, advertising: AdvertisingDto): Promise<Advertising> {
		try {
			return await this.prismaService.advertising.update({ where: { id: id }, data: { name: advertising.name, image: advertising.image } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
