import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { createHash } from 'crypto';

@Injectable()
export class TrackingCacheInterceptor implements NestInterceptor {
	async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
		const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();

		const viewCode = createHash('sha256')
			.update(`${request.query?.token}${request.query?.pub_id ?? ''}${request.query?.sub_id ?? ''}`)
			.digest('base64');
		request.body = { viewCode };

		return next.handle().pipe(
			map((data) => {
				response.redirect(data);
			})
		);
	}
}
