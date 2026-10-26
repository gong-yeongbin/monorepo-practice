// 매체 추가 폼이 URL의 플레이스홀더를 우리 키로 바꿔 저장하는지 검증한다
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';
import { message } from 'antd';
import MediaForm from '@/features/developer/media-form';
import { api } from '@/shared/api/api';

// antd Form(Grid useBreakpoint)·Select(resize-observer)가 jsdom에 없는 API를 요구한다
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
window.ResizeObserver = class {
	observe() {}
	unobserve() {}
	disconnect() {}
};

const renderForm = () =>
	render(
		<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
			<MediaForm />
		</QueryClientProvider>,
	);

const INSTALL_URL = 'https://m.io/p?m=1&tid={tid}';
const EVENT_URL = 'https://m.io/p?m=1&tid={tid}&event={event_name}';

const fillUrls = () => {
	fireEvent.change(screen.getByLabelText('매체명'), { target: { value: 'apptmedia' } });
	fireEvent.change(screen.getByLabelText('인스톨 URL'), { target: { value: INSTALL_URL } });
	fireEvent.change(screen.getByLabelText('이벤트 URL'), { target: { value: EVENT_URL } });
};

// antd Select는 selector를 mouseDown 해야 옵션이 열린다
const pickOption = async (combobox: HTMLElement, label: string) => {
	fireEvent.mouseDown(combobox);
	fireEvent.click(await screen.findByTitle(label));
};

describe('MediaForm', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.spyOn(api, 'createMedia').mockResolvedValue(undefined);
	});

	// message·Select 드롭다운은 document.body에 붙어 언마운트로 정리되지 않는다
	afterEach(() => {
		cleanup();
		document.body.innerHTML = '';
	});

	// Form.useWatch는 다음 렌더에 반영되므로 플레이스홀더 목록은 비동기로 기다린다
	it('URL을 넣으면 플레이스홀더마다 선택 상자가 생긴다', async () => {
		renderForm();
		fillUrls();

		expect(await screen.findByText('{tid}')).toBeTruthy();
		expect(screen.getByText('{event_name}')).toBeTruthy();
		expect(screen.getAllByRole('combobox')).toHaveLength(2);
	});

	it('고른 키로 치환한 URL을 저장한다', async () => {
		renderForm();
		fillUrls();

		// {event_name}은 우리 키와 이름이 같아 자동 선택되고, {tid}만 고른다
		await pickOption((await screen.findAllByRole('combobox'))[0], 'click_id');
		fireEvent.click(screen.getByRole('button', { name: '저장' }));

		await waitFor(() =>
			expect(vi.mocked(api.createMedia).mock.calls[0]?.[0]).toEqual({
				name: 'apptmedia',
				install_postback_url: 'https://m.io/p?m=1&tid={click_id}',
				event_postback_url: 'https://m.io/p?m=1&tid={click_id}&event={event_name}',
			}),
		);
	});

	it('이름이 겹쳐 409가 오면 중복 안내를 띄운다', async () => {
		vi.mocked(api.createMedia).mockRejectedValue(
			new AxiosError('Conflict', '409', undefined, undefined, { status: 409, statusText: '', headers: {}, config: { headers: new AxiosHeaders() }, data: {} }),
		);
		renderForm();
		fillUrls();

		// 정적 message는 jsdom에서 DOM에 바로 안 보이므로 호출 인자로 확인한다
		const errorMessage = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
		fireEvent.click(screen.getByRole('button', { name: '저장' }));

		await waitFor(() => expect(errorMessage).toHaveBeenCalledWith('이미 있는 매체명입니다'));
	});
});
