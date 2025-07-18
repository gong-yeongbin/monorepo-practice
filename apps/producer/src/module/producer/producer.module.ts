import { Module } from '@nestjs/common';
import { ProducerController } from './controller/producer.controller';
import { TrackingProducerUseCase } from './use-case';

@Module({
	controllers: [ProducerController],
	providers: [TrackingProducerUseCase],
})
export class ProducerModule {}
