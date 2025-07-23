import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TrackerRepository } from '../domain';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TrackerDto } from '../shared/dto';
import { Tracker } from '@repo/prisma/entity';

@Injectable()
export class PrismaTrackerRepository implements TrackerRepository {
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

	async create(tracker: TrackerDto): Promise<Tracker> {
		try {
			return await this.prismaService.tracker.create({ data: tracker });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}

	async update(id: number, tracker: TrackerDto): Promise<Tracker> {
		try {
			return await this.prismaService.tracker.update({ where: { id: id }, data: tracker });
		} catch (e) {
			throw new InternalServerErrorException(e.message);
		}
	}
}
