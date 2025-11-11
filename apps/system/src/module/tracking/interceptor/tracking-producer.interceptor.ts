import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Observable } from 'rxjs';
import { base64 } from '@src/common/util/base64.util';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class TrackingProducerInterceptor implements NestInterceptor, OnModuleInit, OnModuleDestroy {
	constructor(@Inject('KAFKA_SERVICE') private readonly client: ClientKafka) {}

	async onModuleInit() {
		this.client.subscribeToResponseOf('tracking');
		await this.client.connect();
	}

	async onModuleDestroy(): Promise<void> {
		await this.client.close();
	}

	async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
		const request = context.switchToHttp().getRequest();
		const viewCode = base64.encode(`${request.query?.token}:${request.query?.pub_id ?? ''}:${request.query?.sub_id ?? ''}`);

		request.body = { viewCode };

		this.client.emit('tracking', { value: viewCode });
		return next.handle();
	}
}
