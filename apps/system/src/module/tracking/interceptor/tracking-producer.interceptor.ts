import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { base64 } from '@src/common/util/base64.util';
import { PRODUCER } from '@core/kafka/symbol';
import { IProducer } from '@core/kafka/interface';

@Injectable()
export class TrackingProducerInterceptor implements NestInterceptor {
	constructor(@Inject(PRODUCER) private readonly producer: IProducer) {}

	async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
		const request = context.switchToHttp().getRequest();
		const viewCode = base64.encode(`${request.query?.token}:${request.query?.pub_id ?? ''}:${request.query?.sub_id ?? ''}`);

		request.body = { viewCode };
		await this.producer.each('tracking', viewCode);
		return next.handle();
	}
}
