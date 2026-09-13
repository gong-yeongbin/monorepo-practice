// advertising 페이지가 서버 페이징으로 목록을 조회하는지(페이지 클릭 → 해당 페이지 재조회, 검색 → 1페이지 복귀) 검증한다
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Advertising from '@/features/advertising/advertising';
import { api } from '@/shared/api/api';

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

vi.mock('@/shared/api/api', () => ({
	api: {
		getAdvertising: vi.fn(),
		getTrackers: vi.fn().mockResolvedValue([]),
		getAdvertisers: vi.fn().mockResolvedValue([]),
	},
}));

const getAdvertising = vi.mocked(api.getAdvertising);

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

const renderPage = () =>
	render(
		<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
			<MemoryRouter>
				<Advertising />
			</MemoryRouter>
		</QueryClientProvider>,
	);

const clickPage = (n: number) => fireEvent.click(document.querySelector(`.ant-pagination-item-${n} a`)!);

describe('Advertising 페이지', () => {
	beforeEach(() => {
		getAdvertising.mockReset();
		getAdvertising.mockResolvedValue({ items: [makeRow('1')], total: 120 });
	});

	it('처음엔 1페이지를 25건 단위로 조회한다', async () => {
		renderPage();
		await waitFor(() => expect(getAdvertising).toHaveBeenCalledWith({ searchWords: '', page: 1, pageSize: 25 }));
	});

	it('페이지 번호를 누르면 그 페이지를 다시 조회한다', async () => {
		renderPage();
		await screen.findByText('앱1');
		clickPage(5);
		await waitFor(() => expect(getAdvertising).toHaveBeenCalledWith({ searchWords: '', page: 5, pageSize: 25 }));
	});

	it('검색하면 1페이지부터 다시 조회한다', async () => {
		renderPage();
		await screen.findByText('앱1');
		clickPage(5);
		await waitFor(() => expect(getAdvertising).toHaveBeenCalledWith(expect.objectContaining({ page: 5 })));

		// 조회 중에는 검색 버튼이 loading이라 클릭이 무시되므로 끝날 때까지 기다린다
		await waitFor(() => expect(document.querySelector('.ant-btn-loading')).toBeNull());

		fireEvent.change(screen.getByRole('searchbox'), { target: { value: '고수' } });
		fireEvent.click(document.querySelector('.ant-input-search-btn')!);
		await waitFor(() => expect(getAdvertising).toHaveBeenCalledWith({ searchWords: '고수', page: 1, pageSize: 25 }));
	});
});
