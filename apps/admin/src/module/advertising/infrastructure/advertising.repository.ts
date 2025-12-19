import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@repo/prisma';
import { CreateAdvertisingDto, UpdateAdvertisingDto } from '@advertising/dto';
import { IAdvertising } from '@advertising/domain/repositories';
import { Advertising } from '@advertising/domain/entities';

@Injectable()
export class AdvertisingRepository implements IAdvertising {
	constructor(private readonly prismaService: PrismaService) {}

	async findById(id: number): Promise<Advertising | null> {
		try {
			return await this.prismaService.advertising.findUnique({ where: { id }, include: { campaign: true } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async findByName(name: string): Promise<Advertising | null> {
		try {
			return await this.prismaService.advertising.findUnique({ where: { name: name }, include: { campaign: { where: { is_active: true } } } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async findMany(): Promise<Advertising[]> {
		try {
			return await this.prismaService.advertising.findMany({ orderBy: { id: 'desc' }, include: { campaign: { where: { is_active: true } } } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async create(advertising: CreateAdvertisingDto): Promise<Advertising> {
		try {
			return await this.prismaService.advertising.create({ data: advertising });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async update(advertising: UpdateAdvertisingDto): Promise<Advertising> {
		try {
			const { id, name, image } = advertising;
			return await this.prismaService.advertising.update({ where: { id }, data: { name, image } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
