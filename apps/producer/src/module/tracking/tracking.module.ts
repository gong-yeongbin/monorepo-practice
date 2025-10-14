import { Module } from '@nestjs/common';
import { TrackingController } from './controller/tracking.controller';
import { TrackingUseCase } from './use-case';

@Module({
	controllers: [TrackingController],
	providers: [TrackingUseCase],
})
export class TrackingModule {}
