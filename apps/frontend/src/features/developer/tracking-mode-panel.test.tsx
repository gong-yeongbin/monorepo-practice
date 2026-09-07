// 트래킹 모드 패널이 차단 방향에만 확인을 받고, 되돌리는 방향은 바로 저장하는지 검증한다
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TrackingModePanel from '@/features/developer/tracking-mode-panel';
import { api } from '@/shared/api/api';

const renderPanel = () =>
	render(
		<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
			<TrackingModePanel />
		</QueryClientProvider>,
	);

const applyButton = () => screen.getByRole('button', { name: '적용' });

describe('TrackingModePanel', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.spyOn(api, 'updateTrackingMode').mockResolvedValue(undefined);
	});

	// Modal.confirm은 antd 전역 컨테이너(document.body)에 붙어 언마운트로 정리되지 않는다
	afterEach(() => {
		cleanup();
		document.body.innerHTML = '';
	});

	it('차단 모드를 고르면 확인을 받은 뒤에 저장한다', async () => {
		vi.spyOn(api, 'getTrackingMode').mockResolvedValue('open');
		renderPanel();

		fireEvent.click(await screen.findByRole('radio', { name: /전면/ }));
		fireEvent.click(applyButton());

		// 확인 모달이 뜨고, 확인 전에는 저장하지 않는다
		// antd Modal은 title을 ant-modal-title·ant-modal-confirm-title 두 요소에 렌더한다
		expect((await screen.findAllByText(/트래킹을 '전면' 모드로 바꿉니다/)).length).toBeGreaterThan(0);
		expect(api.updateTrackingMode).not.toHaveBeenCalled();

		fireEvent.click(await screen.findByRole('button', { name: '차단하기' }));
		// mutate는 두 번째 인자로 react-query 컨텍스트를 넘기므로 첫 인자만 확인한다
		await waitFor(() => expect(vi.mocked(api.updateTrackingMode).mock.calls[0]?.[0]).toBe('closed'));
	});

	it('정상으로 되돌릴 때는 확인 없이 저장한다', async () => {
		vi.spyOn(api, 'getTrackingMode').mockResolvedValue('closed');
		renderPanel();

		fireEvent.click(await screen.findByRole('radio', { name: /정상/ }));
		fireEvent.click(applyButton());

		await waitFor(() => expect(vi.mocked(api.updateTrackingMode).mock.calls[0]?.[0]).toBe('open'));
	});

	it('차단 중이면 현재 상태를 경고로 알린다', async () => {
		vi.spyOn(api, 'getTrackingMode').mockResolvedValue('half');
		renderPanel();

		expect(await screen.findByText(/현재 트래킹이 '절반' 모드입니다/)).toBeTruthy();
	});

	it('현재 모드와 같으면 적용 버튼이 비활성이다', async () => {
		vi.spyOn(api, 'getTrackingMode').mockResolvedValue('open');
		renderPanel();

		await waitFor(() => expect(applyButton().hasAttribute('disabled')).toBe(true));
	});
});
