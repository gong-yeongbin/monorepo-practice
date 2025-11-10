import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { KafkaProducerService } from '@core/kafka/kafka-producer.service';

@Injectable()
export class PostbackProducerInterceptor implements NestInterceptor {
	constructor(private readonly producerService: KafkaProducerService) {}

	async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
		return next.handle().pipe(
			map(async (data) => {
				await this.producerService.each('postback', JSON.stringify(data));
			})
		);
	}
}
