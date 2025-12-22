import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '@repo/prisma';
import { CreateTrackerDto, UpdateTrackerDto } from '@module/tracker/dto';
import { ITracker } from '@module/tracker/domain/repositories';
import { Tracker } from '@module/tracker/domain/entities';

@Injectable()
export class TrackerRepository implements ITracker {
	constructor(private readonly prismaService: PrismaService) {}

	async findById(id: number): Promise<Tracker | null> {
		try {
			return await this.prismaService.tracker.findUnique({ where: { id: id } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async findByName(name: string): Promise<Tracker | null> {
		try {
			return await this.prismaService.tracker.findUnique({ where: { name: name } });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async findMany(): Promise<Tracker[]> {
		try {
			return await this.prismaService.tracker.findMany();
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async create(tracker: CreateTrackerDto): Promise<Tracker> {
		try {
			return await this.prismaService.tracker.create({ data: tracker });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async update(tracker: UpdateTrackerDto): Promise<Tracker> {
		try {
			return await this.prismaService.tracker.update({ where: { id: tracker.id }, data: tracker });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
