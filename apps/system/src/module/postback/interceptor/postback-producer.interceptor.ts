import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class PostbackProducerInterceptor implements NestInterceptor, OnModuleInit, OnModuleDestroy {
	constructor(@Inject('KAFKA_SERVICE') private readonly client: ClientKafka) {}

	async onModuleInit() {
		this.client.subscribeToResponseOf('postback');
		await this.client.connect();
	}

	async onModuleDestroy(): Promise<void> {
		await this.client.close();
	}

	async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
		return next.handle().pipe(
			map(async (data) => {
				this.client.emit('postback', { value: JSON.stringify(data) });
			})
		);
	}
}
