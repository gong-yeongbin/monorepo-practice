import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { KafkaOptions, MicroserviceOptions, Transport } from '@nestjs/microservices';

export const KAFKA_OPTION: KafkaOptions['options'] = {
	client: {
		clientId: 'mecross-system',
		brokers: ['localhost:9092'],
	},
	consumer: {
		groupId: 'mecross-system-consumer',
	},
	producer: {
		allowAutoTopicCreation: true,
		retry: { retries: 0 },
	},
};

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const configService = app.get<ConfigService>(ConfigService);
	const port = configService.get<number>('PORT');

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		})
	);

	await app.startAllMicroservices();
	await app.listen(port ? port : 3000);
}
bootstrap();
