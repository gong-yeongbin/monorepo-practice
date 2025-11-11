import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ProducerService } from '@core/kafka/producer.service';

@Injectable()
export class PostbackProducerInterceptor implements NestInterceptor {
	constructor(private readonly producer: ProducerService) {}

	async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
		return next.handle().pipe(
			map(async (data) => {
				await this.producer.each('postback', JSON.stringify(data));
			})
		);
	}
}
