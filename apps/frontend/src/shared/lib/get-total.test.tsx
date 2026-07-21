// get-total의 컬럼 합계(getTotal) 렌더 테스트 — useMemo·JSX를 쓰므로 컴포넌트로 렌더해 검증한다
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { getTotal } from '@/shared/lib/get-total';

// react-table info 객체의 최소 형태를 흉내낸다.
const makeInfo = (columnId: string, rows: Array<{ original: Record<string, unknown> }>) => ({
	column: { id: columnId },
	table: { getRowModel: () => ({ rows }) },
});

// getTotal은 useMemo를 호출하므로 컴포넌트 안에서 렌더해야 한다.
const renderTotal = (info: ReturnType<typeof makeInfo>) => {
	const Wrapper = () => getTotal(info);
	const { container } = render(<Wrapper />);
	return container.querySelector('.total')?.textContent;
};

describe('getTotal (일반 컬럼)', () => {
	it('콤마가 있는 문자열 값에서 콤마를 제거하고 합산한다', () => {
		const info = makeInfo('click', [
			{ original: { click: '1,000' } },
			{ original: { click: '2,500' } },
		]);
		expect(renderTotal(info)).toBe('3,500');
	});

	it('콤마 없는 문자열 값도 합산한다', () => {
		const info = makeInfo('install', [
			{ original: { install: '60' } },
			{ original: { install: '518' } },
		]);
		expect(renderTotal(info)).toBe('578');
	});

	it('합계가 천 단위 이상이면 콤마로 포맷한다', () => {
		const info = makeInfo('click', [
			{ original: { click: '1,792,039' } },
			{ original: { click: '6,058,020' } },
		]);
		expect(renderTotal(info)).toBe('7,850,059');
	});

	it('행이 하나면 그 값이 그대로 합계가 된다', () => {
		const info = makeInfo('revenue', [{ original: { revenue: '29,600' } }]);
		expect(renderTotal(info)).toBe('29,600');
	});
});

describe('getTotal (cvr 컬럼)', () => {
	it('cvr 값들을 더해 소수점 2자리 + % 로 포맷한다', () => {
		const info = makeInfo('cvr', [
			{ original: { cvr: 5 } },
			{ original: { cvr: 2.5 } },
		]);
		expect(renderTotal(info)).toBe('7.50%');
	});

	it('cvr 합계가 천 단위 이상이면 콤마를 넣는다', () => {
		const info = makeInfo('cvr', [
			{ original: { cvr: 1000 } },
			{ original: { cvr: 234.5 } },
		]);
		expect(renderTotal(info)).toBe('1,234.50%');
	});
});
