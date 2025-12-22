import { Module } from '@nestjs/common';
import { TrackerResolver } from '@module/tracker/controller';
import { CreateTrackerUseCase, GetTrackerListUseCase, UpdateTrackerUseCase } from '@module/tracker/use-case';
import { TrackerRepository } from '@module/tracker/infrastructure';
import { TRACKER_REPOSITORY } from '@module/tracker/domain/symbol';

@Module({
	providers: [TrackerResolver, CreateTrackerUseCase, UpdateTrackerUseCase, GetTrackerListUseCase, { provide: TRACKER_REPOSITORY, useClass: TrackerRepository }],
	exports: [TRACKER_REPOSITORY],
})
export class TrackerModule {}
