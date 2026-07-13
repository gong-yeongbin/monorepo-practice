// Prisma로 tracker 테이블을 조회·생성·수정·삭제하는 repository 구현체
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Tracker } from '@tracker/domain/tracker.entity';
import { CreateTrackerProps, TrackerRepository, UpdateTrackerProps } from '@tracker/domain/tracker.repository';

@Injectable()
export class PrismaTrackerRepository implements TrackerRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findAll(): Promise<Tracker[]> {
		return this.prismaService.tracker.findMany();
	}

	async findById(id: number): Promise<Tracker | null> {
		return this.prismaService.tracker.findUnique({ where: { id } });
	}

	async findByName(name: string): Promise<Tracker | null> {
		return this.prismaService.tracker.findUnique({ where: { name } });
	}

	async create(props: CreateTrackerProps): Promise<Tracker> {
		return this.prismaService.tracker.create({ data: props });
	}

	async update(id: number, props: UpdateTrackerProps): Promise<Tracker> {
		return this.prismaService.tracker.update({ where: { id }, data: props });
	}

	async delete(id: number): Promise<void> {
		await this.prismaService.tracker.delete({ where: { id } });
	}

	async countAdvertising(tracker_id: number): Promise<number> {
		return this.prismaService.advertising.count({ where: { tracker_id } });
	}
}
