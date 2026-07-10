import { Module } from '@nestjs/common';
import { TrackerController } from '@tracker/presentation/tracker.controller';
import { ListTrackerUseCase } from '@tracker/application/list-tracker.use-case';
import { TRACKER_REPOSITORY } from '@tracker/domain/tracker.repository';
import { PrismaTrackerRepository } from '@tracker/infrastructure/prisma-tracker.repository';

@Module({
	controllers: [TrackerController],
	providers: [ListTrackerUseCase, { provide: TRACKER_REPOSITORY, useClass: PrismaTrackerRepository }],
})
export class TrackerModule {}
