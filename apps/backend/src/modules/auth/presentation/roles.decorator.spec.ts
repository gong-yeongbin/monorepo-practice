// @Roles(...)가 ROLES_KEY 메타데이터에 역할 목록을 남기는지 검증
import 'reflect-metadata';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Roles } from './roles.decorator';

describe('Roles', () => {
	it('선언한 역할 목록을 ROLES_KEY에 심는다', () => {
		@Roles('DEVELOPER', 'ADMIN')
		class OperationController {}

		expect(new Reflector().get(ROLES_KEY, OperationController)).toEqual(['DEVELOPER', 'ADMIN']);
	});

	it('데코레이터가 없으면 메타데이터도 없다', () => {
		class PlainController {}

		expect(new Reflector().get(ROLES_KEY, PlainController)).toBeUndefined();
	});
});
