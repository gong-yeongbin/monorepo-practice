// dashboard-table이 data prop 변경(날짜 전환)을 반영해 행을 갱신하는지 검증한다
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import DashboardTable from '@/features/home/dashboard-table';

const makeRow = (idx: string, name: string) => ({
	idx,
	name,
	platform: 'aos',
	click: '0',
	install: '0',
	registration: '0',
	retention: '0',
	purchase: '0',
	revenue: '0',
	etc1: '0',
	etc2: '0',
	etc3: '0',
	etc4: '0',
	etc5: '0',
});

const renderTable = (data: ReturnType<typeof makeRow>[]) =>
	render(
		<MemoryRouter>
			<DashboardTable data={data} />
		</MemoryRouter>,
	);

const bodyNames = (container: HTMLElement) => Array.from(container.querySelectorAll('tbody td:first-child')).map(td => td.textContent);

describe('DashboardTable', () => {
	it('data prop이 바뀌면 새 데이터의 행을 보여준다', () => {
		const { container, rerender } = renderTable([makeRow('1', '어제 앱')]);
		expect(bodyNames(container)).toEqual(['어제 앱']);

		rerender(
			<MemoryRouter>
				<DashboardTable data={[makeRow('2', '오늘 앱')]} />
			</MemoryRouter>,
		);
		expect(bodyNames(container)).toEqual(['오늘 앱']);
	});

	it('name이 null인 행은 제외한다', () => {
		const { container } = renderTable([makeRow('1', '앱'), { ...makeRow('2', ''), name: null as unknown as string }]);
		expect(bodyNames(container)).toEqual(['앱']);
	});
});
