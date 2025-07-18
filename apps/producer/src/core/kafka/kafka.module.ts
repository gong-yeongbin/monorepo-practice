import { Global, Module } from '@nestjs/common';
import { KafkaAdapter } from './kafka.adapter';
import { KafkaService } from './kafka.service';

@Global()
@Module({
	providers: [{ provide: KafkaService, useClass: KafkaAdapter }],
	exports: [KafkaService],
})
export class KafkaModule {}
