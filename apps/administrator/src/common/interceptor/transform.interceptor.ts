import { CallHandler, Injectable, NestInterceptor } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common/interfaces/features/execution-context.interface';
import { map, Observable } from 'rxjs';

export interface Response<T> {
	statusCode: number;
	data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
	intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
		const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();

		const query = request.query;
		const params = request.params;

		return next.handle().pipe(
			map((data) => ({
				statusCode: response.statusCode,
				data: data,
				_meta: { query, params },
			}))
		);
	}
}
