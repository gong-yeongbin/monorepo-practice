import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get<ConfigService>(ConfigService);

	const port = configService.get<number>('PORT');
	const brokers = configService.get<string>('KAFKA', '').split(',');

	// app.connectMicroservice<MicroserviceOptions>({
	// 	transport: Transport.KAFKA,
	// 	options: {
	// 		client: {
	// 			clientId: 'mecross',
	// 			brokers: brokers,
	// 		},
	// 	},
	// });

	// await app.startAllMicroservices();
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		})
	);
	await app.listen(port ? port : 3000);
}
bootstrap();
