// api.tsx의 CVR 파생 로직(getDataWithCvr) 단위 테스트
import { describe, it, expect } from 'vitest';
import { getDataWithCvr } from '@/shared/api/api';

describe('getDataWithCvr', () => {
	it('install / click * 100 을 소수점 2자리로 반올림해 cvr에 채운다', () => {
		const [row] = getDataWithCvr([{ install: '60', click: '1200' }]);
		// 60 / 1200 * 100 = 5
		expect(row.cvr).toBe(5);
	});

	it('반올림은 소수점 2자리에서 이뤄진다', () => {
		const [row] = getDataWithCvr([{ install: '1', click: '3' }]);
		// 1 / 3 * 100 = 33.333... → 33.33
		expect(row.cvr).toBe(33.33);
	});

	it('click이 0이면 0으로 나눠 Infinity가 되므로 0으로 보정한다', () => {
		const [row] = getDataWithCvr([{ install: '10', click: '0' }]);
		expect(row.cvr).toBe(0);
	});

	it('install·click이 숫자가 아니면 NaN이 되므로 0으로 보정한다', () => {
		const [row] = getDataWithCvr([{ install: 'abc', click: 'def' }]);
		expect(row.cvr).toBe(0);
	});

	it('여러 행을 각각 계산한다', () => {
		const rows = getDataWithCvr([
			{ install: '50', click: '100' },
			{ install: '25', click: '100' },
		]);
		expect(rows.map((r: { cvr: number }) => r.cvr)).toEqual([50, 25]);
	});

	it('원본 배열과 다른 새 배열을 반환한다(얕은 복사)', () => {
		const input = [{ install: '60', click: '1200' }];
		const output = getDataWithCvr(input);
		expect(output).not.toBe(input);
	});
});
