import { Module } from '@nestjs/common';
import { TrackerController } from '@module/tracker/controller';
import { CreateTrackerUseCase, UpdateTrackerUseCase } from '@module/tracker/use-case';
import { TrackerRepository } from '@module/tracker/infrastructure';
import { TRACKER_REPOSITORY } from '@module/tracker/domain';

@Module({
	controllers: [TrackerController],
	providers: [CreateTrackerUseCase, UpdateTrackerUseCase, { provide: TRACKER_REPOSITORY, useClass: TrackerRepository }],
})
export class TrackerModule {}
