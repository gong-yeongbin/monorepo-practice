// Prisma로 tracker 테이블을 조회하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Tracker } from '@tracker/domain/tracker.entity';
import { TrackerRepository } from '@tracker/domain/tracker.repository';

@Injectable()
export class PrismaTrackerRepository implements TrackerRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findAll(): Promise<Tracker[]> {
		return this.prismaService.tracker.findMany();
	}
}
