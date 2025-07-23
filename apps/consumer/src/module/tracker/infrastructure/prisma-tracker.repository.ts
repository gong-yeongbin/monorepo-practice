import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Tracker, TrackerRepository } from '../domain';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TrackerDto } from '../shared/dto';

@Injectable()
export class PrismaTrackerRepository implements TrackerRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async find(name: string): Promise<Tracker | null> {
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
}
