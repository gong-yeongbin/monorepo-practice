// Prisma로 advertiser를 조회·생성하는 repository 구현체
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

	async findByName(name: string): Promise<Advertiser | null> {
		return this.prismaService.advertiser.findUnique({ where: { name } });
	}

	async create(name: string): Promise<Advertiser> {
		return this.prismaService.advertiser.create({ data: { name } });
	}
}
