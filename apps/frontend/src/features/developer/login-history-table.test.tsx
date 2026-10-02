// 로그인 기록 탭이 서버 페이징으로 목록을 조회하고(페이지 클릭 → 해당 페이지 재조회) 결과·UA 해석값을 표시하는지 검증한다
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginHistoryTable from '@/features/developer/login-history-table';
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
		getLoginHistories: vi.fn(),
	},
}));

const getLoginHistories = vi.mocked(api.getLoginHistories);

const row = {
	idx: '1',
	email: 'admin@test.com',
	result: 'SUCCESS',
	ip: '203.0.113.10',
	browser: 'Chrome',
	os: 'macOS',
	deviceType: 'desktop',
	createdAt: '2026-10-02T13:04:29.000Z',
};

const renderTable = () =>
	render(
		<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
			<LoginHistoryTable />
		</QueryClientProvider>,
	);

const clickPage = (n: number) => fireEvent.click(document.querySelector(`.ant-pagination-item-${n} a`)!);

describe('LoginHistoryTable', () => {
	beforeEach(() => {
		getLoginHistories.mockReset();
		getLoginHistories.mockResolvedValue({ items: [row], total: 120 });
	});

	it('처음엔 1페이지를 25건 단위로 조회한다', async () => {
		renderTable();
		await waitFor(() => expect(getLoginHistories).toHaveBeenCalledWith({ page: 1, pageSize: 25 }));
	});

	it('이메일·결과·IP·브라우저/OS·기기를 한 행에 표시한다', async () => {
		renderTable();
		expect(await screen.findByText('admin@test.com')).toBeTruthy();
		expect(screen.getByText('성공')).toBeTruthy();
		expect(screen.getByText('203.0.113.10')).toBeTruthy();
		expect(screen.getByText('Chrome · macOS')).toBeTruthy();
		expect(screen.getByText('desktop')).toBeTruthy();
	});

	it('실패 결과는 사유별 라벨로 표시한다', async () => {
		getLoginHistories.mockResolvedValue({
			items: [
				{ ...row, idx: '2', result: 'INVALID_CREDENTIALS' },
				{ ...row, idx: '3', result: 'NOT_APPROVED' },
			],
			total: 2,
		});
		renderTable();
		expect(await screen.findByText('비밀번호 불일치')).toBeTruthy();
		expect(screen.getByText('미승인 계정')).toBeTruthy();
	});

	it('UA를 해석하지 못한 기록은 브라우저/OS를 비워 둔다', async () => {
		getLoginHistories.mockResolvedValue({ items: [{ ...row, browser: null, os: null, deviceType: 'unknown' }], total: 1 });
		renderTable();
		await screen.findByText('admin@test.com');
		expect(screen.getByText('-')).toBeTruthy();
	});

	it('페이지 번호를 누르면 그 페이지를 다시 조회한다', async () => {
		renderTable();
		await screen.findByText('admin@test.com');
		clickPage(5);
		await waitFor(() => expect(getLoginHistories).toHaveBeenCalledWith({ page: 5, pageSize: 25 }));
	});

	it('기록이 없으면 빈 테이블을 보여준다', async () => {
		getLoginHistories.mockResolvedValue({ items: [], total: 0 });
		renderTable();
		await waitFor(() => expect(getLoginHistories).toHaveBeenCalled());
		expect(document.querySelector('.ant-pagination')).toBeNull();
	});
});
