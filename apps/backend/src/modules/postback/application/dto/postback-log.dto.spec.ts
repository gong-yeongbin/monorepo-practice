// ValidateIf 조건(token은 view_code가 없을 때만 필수)을 검증한다. 순수 DTO spec이라 reflect-metadata 직접 import 필요.
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { EventLogDto, InstallLogDto, UnregisteredLogDto } from './postback-log.dto';

describe('InstallLogDto', () => {
	const dates = { start_date: '2026-07-01', end_date: '2026-07-10' };

	it('view_code가 없으면 token이 필수다', async () => {
		const errors = await validate(plainToInstance(InstallLogDto, dates));
		expect(errors.some((error) => error.property === 'token')).toBe(true);
	});

	it('view_code가 있으면 token 없이 통과한다', async () => {
		expect(await validate(plainToInstance(InstallLogDto, { view_code: 'vc1', ...dates }))).toEqual([]);
	});

	it('token만 있어도 통과한다', async () => {
		expect(await validate(plainToInstance(InstallLogDto, { token: 'tok', ...dates }))).toEqual([]);
	});
});

describe('EventLogDto', () => {
	it('token과 event_name이 없으면 검증에 실패한다', async () => {
		const errors = await validate(plainToInstance(EventLogDto, { start_date: '2026-07-01', end_date: '2026-07-10' }));
		expect(errors.map((error) => error.property)).toEqual(expect.arrayContaining(['token', 'event_name']));
	});
});

describe('UnregisteredLogDto', () => {
	it('token·날짜가 채워지면 통과한다', async () => {
		expect(await validate(plainToInstance(UnregisteredLogDto, { token: 'tok', start_date: '2026-07-01', end_date: '2026-07-10' }))).toEqual([]);
	});
});
