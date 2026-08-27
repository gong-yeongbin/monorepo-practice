// @Transform이 approved 쿼리 문자열을 boolean으로 바꾸되 미지정은 undefined로 남기는지 검증
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { ListUserDto } from './list-user.dto';

describe('ListUserDto', () => {
	it("'false' 문자열을 false로 변환한다", () => {
		expect(plainToInstance(ListUserDto, { approved: 'false' }).approved).toBe(false);
	});

	it("'true' 문자열을 true로 변환한다", () => {
		expect(plainToInstance(ListUserDto, { approved: 'true' }).approved).toBe(true);
	});

	// 여기서 false가 되면 필터 없는 조회가 승인 대기 목록만 반환하게 된다
	it('approved를 주지 않으면 undefined로 남긴다', () => {
		expect(plainToInstance(ListUserDto, {}).approved).toBeUndefined();
	});
});
