// @Public()이 IS_PUBLIC_KEY 메타데이터를 남기는지 검증
import 'reflect-metadata';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, Public } from './public.decorator';

describe('Public', () => {
	it('대상 클래스에 IS_PUBLIC_KEY=true를 심는다', () => {
		@Public()
		class PublicController {}

		expect(new Reflector().get(IS_PUBLIC_KEY, PublicController)).toBe(true);
	});

	it('데코레이터가 없으면 메타데이터도 없다', () => {
		class PlainController {}

		expect(new Reflector().get(IS_PUBLIC_KEY, PlainController)).toBeUndefined();
	});
});
