// ResponseInterceptor가 응답을 { statusCode, data, _meta }로 감싸는지 검증
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
	const interceptor = new ResponseInterceptor();

	function contextOf(request: unknown, statusCode: number): ExecutionContext {
		return {
			switchToHttp: () => ({
				getRequest: () => request,
				getResponse: () => ({ statusCode }),
			}),
		} as unknown as ExecutionContext;
	}

	it('body·query를 _meta로 합치고 statusCode·data와 함께 감싼다', async () => {
		const context = contextOf({ body: { name: 'a' }, query: { page: '1' } }, 201);
		const next: CallHandler = { handle: () => of({ id: 1 }) };

		const result = await lastValueFrom(interceptor.intercept(context, next));

		expect(result).toEqual({ statusCode: 201, data: { id: 1 }, _meta: { name: 'a', page: '1' } });
	});

	it('body가 없어도 query만으로 _meta를 만든다', async () => {
		const context = contextOf({ query: { q: 'x' } }, 200);
		const next: CallHandler = { handle: () => of('ok') };

		const result = await lastValueFrom(interceptor.intercept(context, next));

		expect(result).toEqual({ statusCode: 200, data: 'ok', _meta: { q: 'x' } });
	});
});
