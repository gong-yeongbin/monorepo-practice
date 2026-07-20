import { Module } from '@nestjs/common';
import { TrackerController } from '@tracker/presentation/tracker.controller';
import { ListTrackerUseCase } from '@tracker/application/list-tracker.use-case';
import { GetTrackerUseCase } from '@tracker/application/get-tracker.use-case';
import { CreateTrackerUseCase } from '@tracker/application/create-tracker.use-case';
import { UpdateTrackerUseCase } from '@tracker/application/update-tracker.use-case';
import { DeleteTrackerUseCase } from '@tracker/application/delete-tracker.use-case';
import { TRACKER_REPOSITORY } from '@tracker/domain/tracker.repository';
import { PrismaTrackerRepository } from '@tracker/infrastructure/prisma-tracker.repository';

@Module({
	controllers: [TrackerController],
	providers: [
		ListTrackerUseCase,
		GetTrackerUseCase,
		CreateTrackerUseCase,
		UpdateTrackerUseCase,
		DeleteTrackerUseCase,
		{ provide: TRACKER_REPOSITORY, useClass: PrismaTrackerRepository },
	],
})
export class TrackerModule {}
