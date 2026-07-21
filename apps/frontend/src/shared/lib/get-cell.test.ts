// get-cell의 순수 셀 렌더 헬퍼(normal·cvr·status·createdAt) 단위 테스트
import { describe, it, expect } from 'vitest';
import { getCell } from '@/shared/lib/get-cell';

// react-table info 객체의 최소 형태를 흉내낸다.
const makeInfo = (columnId: string, original: Record<string, unknown>) => ({
	column: { id: columnId },
	row: { original },
});

describe('getCell.normal', () => {
	it('숫자를 천단위 콤마로 포맷한다', () => {
		expect(getCell.normal(makeInfo('click', { click: 1792039 }))).toBe('1,792,039');
	});

	it('문자열 숫자도 천단위 콤마로 포맷한다', () => {
		expect(getCell.normal(makeInfo('click', { click: '6058020' }))).toBe('6,058,020');
	});

	it('네 자리 미만은 콤마 없이 그대로 둔다', () => {
		expect(getCell.normal(makeInfo('install', { install: 60 }))).toBe('60');
	});

	it('falsy 값(0)은 숫자 0을 반환한다', () => {
		expect(getCell.normal(makeInfo('install', { install: 0 }))).toBe(0);
	});

	it('빈 문자열도 0을 반환한다', () => {
		expect(getCell.normal(makeInfo('install', { install: '' }))).toBe(0);
	});
});

describe('getCell.cvr', () => {
	it('cvr을 소수점 2자리 + % 로 포맷한다', () => {
		expect(getCell.cvr(makeInfo('cvr', { cvr: 12.3456 }))).toBe('12.35%');
	});

	it('정수 cvr도 소수점 2자리로 채운다', () => {
		expect(getCell.cvr(makeInfo('cvr', { cvr: 7 }))).toBe('7.00%');
	});

	it('천 단위 이상 cvr에 콤마를 넣는다', () => {
		expect(getCell.cvr(makeInfo('cvr', { cvr: 1234.5 }))).toBe('1,234.50%');
	});
});

describe('getCell.status', () => {
	it('status가 1이면 진행 중을 반환한다', () => {
		expect(getCell.status(makeInfo('status', { status: 1 }))).toBe('진행 중');
	});

	it('status가 1이 아니면 - 를 반환한다', () => {
		expect(getCell.status(makeInfo('status', { status: 0 }))).toBe('-');
	});
});

describe('getCell.createdAt', () => {
	it('ISO 날짜에서 YY-MM-DD 부분(2~10)만 잘라낸다', () => {
		expect(getCell.createdAt(makeInfo('createdAt', { createdAt: '2022-06-10T04:53:42.068Z' }))).toBe(
			'22-06-10',
		);
	});
});
