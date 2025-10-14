import { Module } from '@nestjs/common';
import { TrackingController } from './controller/tracking.controller';
import { TrackingProducerUseCase } from './use-case';

@Module({
	controllers: [TrackingController],
	providers: [TrackingProducerUseCase],
})
export class TrackingModule {}
