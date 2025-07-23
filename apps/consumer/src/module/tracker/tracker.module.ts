import { Module } from '@nestjs/common';
import { TrackerController } from './controller/tracker.controller';
import { TrackerRepository } from './domain';
import { PrismaTrackerRepository } from './infrastructure';
import { CreateTrackerUseCase, UpdateTrackerUseCase } from './use-case';

@Module({
	controllers: [TrackerController],
	providers: [CreateTrackerUseCase, UpdateTrackerUseCase, { provide: TrackerRepository, useClass: PrismaTrackerRepository }],
})
export class TrackerModule {}
