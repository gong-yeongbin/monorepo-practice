import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { PRODUCER } from '@core/kafka/symbol';
import { IProducer } from '@core/kafka/interface';

@Injectable()
export class PostbackProducerInterceptor implements NestInterceptor {
	constructor(@Inject(PRODUCER) private readonly producer: IProducer) {}

	async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
		return next.handle().pipe(
			map(async (data) => {
				await this.producer.each('postback', JSON.stringify(data));
			})
		);
	}
}
