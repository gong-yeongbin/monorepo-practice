import { Module } from '@nestjs/common';
import { TrackerController } from '@module/tracker/controller';
import { CreateTrackerUseCase, UpdateTrackerUseCase } from '@module/tracker/use-case';
import { TrackerRepository } from '@module/tracker/domain';
import { PrismaTrackerRepository } from '@module/tracker/infrastructure';

@Module({
	controllers: [TrackerController],
	providers: [CreateTrackerUseCase, UpdateTrackerUseCase, { provide: TrackerRepository, useClass: PrismaTrackerRepository }],
})
export class TrackerModule {}
