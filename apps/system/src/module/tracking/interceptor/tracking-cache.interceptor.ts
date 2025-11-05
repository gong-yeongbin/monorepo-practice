import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable, of } from 'rxjs';
import { createHash } from 'crypto';
import { ICache } from '@src/core/cache/domain/repositories';
import { CACHE_REPOSITORY } from '@src/core/cache/domain/symbol';

@Injectable()
export class TrackingCacheInterceptor implements NestInterceptor {
	constructor(@Inject(CACHE_REPOSITORY) private readonly cache: ICache) {}

	async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
		const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();

		const viewCode = createHash('sha256')
			.update(`${request.query?.token}${request.query?.pub_id ?? ''}${request.query?.sub_id ?? ''}`)
			.digest('base64');
		request.body = { viewCode };

		const url = await this.cache.get(viewCode);
		if (url) {
			return of(response.redirect(url));
		} else {
			return next.handle().pipe(
				map(async (data) => {
					await this.cache.set(viewCode, data, 1000 * 60 * 30);
					response.redirect(data);
				})
			);
		}
	}
}
