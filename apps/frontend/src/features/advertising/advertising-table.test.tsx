// advertising-table이 서버 페이징 props(page·total)로 페이지네이션을 그리고 페이지 클릭을 위로 올리는지 검증한다
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import AdvertisingTable from '@/features/advertising/advertising-table';

// antd Pagination(Grid useBreakpoint)이 jsdom에 없는 matchMedia를 요구한다
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	}),
});

const makeRow = (idx: string) => ({
	idx,
	name: `앱${idx}`,
	platform: 'AOS',
	imageUrl: null,
	createdAt: '',
	updatedAt: '',
	status: 1,
	campaign: 0,
});

const renderTable = (props: { page: number; total: number; rows?: number; onPageChange?: (page: number) => void }) =>
	render(
		<MemoryRouter>
			<AdvertisingTable
				data={Array.from({ length: props.rows ?? 2 }, (_, i) => makeRow(String(i + 1)))}
				page={props.page}
				total={props.total}
				onPageChange={props.onPageChange ?? (() => {})}
			/>
		</MemoryRouter>,
	);

const pageItems = (container: HTMLElement) => Array.from(container.querySelectorAll('.ant-pagination-item')).map(li => li.textContent);

describe('AdvertisingTable', () => {
	it('total에 맞춰 페이지 번호를 그리고 page를 현재 페이지로 표시한다', () => {
		const { container } = renderTable({ page: 5, total: 120 });
		expect(pageItems(container)).toEqual(['1', '2', '3', '4', '5']);
		expect(container.querySelector('.ant-pagination-item-active')?.textContent).toBe('5');
	});

	it('받은 data를 클라이언트에서 자르지 않고 전부 행으로 보여준다', () => {
		const { container } = renderTable({ page: 1, total: 120, rows: 30 });
		expect(container.querySelectorAll('tbody tr').length).toBe(30);
	});

	it('페이지 번호를 누르면 onPageChange에 그 번호를 넘긴다', () => {
		const onPageChange = vi.fn();
		const { container } = renderTable({ page: 1, total: 120, onPageChange });
		fireEvent.click(container.querySelector('.ant-pagination-item-3 a')!);
		expect(onPageChange).toHaveBeenCalledWith(3);
	});
});
