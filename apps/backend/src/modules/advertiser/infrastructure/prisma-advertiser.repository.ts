// Prisma로 advertiser를 조회·생성·수정·삭제하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Advertiser } from '@advertiser/domain/advertiser.entity';
import { AdvertiserRepository } from '@advertiser/domain/advertiser.repository';

@Injectable()
export class PrismaAdvertiserRepository implements AdvertiserRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findAll(): Promise<Advertiser[]> {
		return this.prismaService.advertiser.findMany();
	}

	async findById(id: number): Promise<Advertiser | null> {
		return this.prismaService.advertiser.findUnique({ where: { id } });
	}

	async findByName(name: string): Promise<Advertiser | null> {
		return this.prismaService.advertiser.findUnique({ where: { name } });
	}

	async create(name: string): Promise<Advertiser> {
		return this.prismaService.advertiser.create({ data: { name } });
	}

	async update(id: number, name: string): Promise<Advertiser> {
		return this.prismaService.advertiser.update({ where: { id }, data: { name } });
	}

	async delete(id: number): Promise<void> {
		await this.prismaService.advertiser.delete({ where: { id } });
	}

	async countAdvertising(advertiser_id: number): Promise<number> {
		return this.prismaService.advertising.count({ where: { advertiser_id } });
	}
}
