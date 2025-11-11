import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { base64 } from '@src/common/util/base64.util';
import { ProducerService } from '@core/kafka/producer.service';

@Injectable()
export class TrackingProducerInterceptor implements NestInterceptor {
	constructor(private readonly producer: ProducerService) {}

	async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
		const request = context.switchToHttp().getRequest();
		const viewCode = base64.encode(`${request.query?.token}:${request.query?.pub_id ?? ''}:${request.query?.sub_id ?? ''}`);

		request.body = { viewCode };
		await this.producer.each('tracking', viewCode);
		return next.handle();
	}
}
