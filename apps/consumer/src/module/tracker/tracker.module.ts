import { Module } from '@nestjs/common';
import { TrackerController } from './controller/tracker.controller';
import { TrackerRepository } from './domain';
import { PrismaTrackerRepository } from './infrastructure';
import { CreateTrackerUseCase } from './use-case';

@Module({
	controllers: [TrackerController],
	providers: [CreateTrackerUseCase, { provide: TrackerRepository, useClass: PrismaTrackerRepository }],
})
export class TrackerModule {}
