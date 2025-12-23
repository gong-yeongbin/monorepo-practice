import { Module } from '@nestjs/common';
import { TrackerResolver } from '@tracker/controller';
import { CreateTrackerUseCase, GetTrackerListUseCase, UpdateTrackerUseCase } from '@tracker/use-case';
import { TRACKER_REPOSITORY } from '@tracker/domain/symbol';
import { TrackerRepository } from '@tracker/infrastructure';

@Module({
	providers: [TrackerResolver, CreateTrackerUseCase, UpdateTrackerUseCase, GetTrackerListUseCase, { provide: TRACKER_REPOSITORY, useClass: TrackerRepository }],
	exports: [TRACKER_REPOSITORY],
})
export class TrackerModule {}
