// 어드민 API 응답을 { statusCode, data, _meta }로 감싸는 인터셉터
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { map, Observable } from 'rxjs';

export interface WrappedResponse<T> {
	statusCode: number;
	data: T;
	_meta: Record<string, unknown>;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, WrappedResponse<T>> {
	intercept(context: ExecutionContext, next: CallHandler): Observable<WrappedResponse<T>> {
		const http = context.switchToHttp();
		const request = http.getRequest<Request>();
		const body = (request.body ?? {}) as Record<string, unknown>;
		const query = request.query as Record<string, unknown>;
		const _meta: Record<string, unknown> = { ...body, ...query };

		return next.handle().pipe(
			map((data: T) => ({
				statusCode: http.getResponse<Response>().statusCode,
				data,
				_meta,
			}))
		);
	}
}
