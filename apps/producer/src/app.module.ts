import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ProducerModule } from './module';
import { KafkaModule } from './core/kafka/kafka.module';

@Module({
	imports: [ConfigModule.forRoot(), KafkaModule, ProducerModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
