// backend에 아직 없는 엔드포인트만 목킹한다. 나머지 요청은 워커를 통과해 실제 backend(3001)로 간다.
import { http, HttpResponse } from 'msw';

const baseURL = import.meta.env.VITE_API_URL;

export const handlers = [
	// 광고 상태 토글 — backend의 advertising status는 활성 캠페인 여부에서 파생되는 값이라 토글 endpoint가 없다
	http.patch(`${baseURL}/advertising/:id`, () => {
		return HttpResponse.json({ data: null });
	}),

	// 캠페인 block 토글 — backend에 block 필드가 없다
	http.patch(`${baseURL}/campaigns/:id/block`, () => {
		return HttpResponse.json({ data: null });
	}),
];
