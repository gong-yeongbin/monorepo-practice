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

	// 일자별 상세(viewCode·pubId 단위) — backend에 없다
	http.get(`${baseURL}/advertising/dailydetail`, () => {
		return HttpResponse.json({ data: [] });
	}),

	// 예약 변경 화면 — reservation 모듈이 backend에 없다
	http.get(`${baseURL}/reservation/on/:id`, () => {
		return HttpResponse.json({ data: [] });
	}),
	http.get(`${baseURL}/reservation/off/:id`, () => {
		return HttpResponse.json({ data: [] });
	}),
	http.put(`${baseURL}/reservation`, () => {
		return HttpResponse.json({ data: null });
	}),
	http.delete(`${baseURL}/reservation/:idx`, () => {
		return HttpResponse.json({ data: null });
	}),

	// 로그 조회 모달 3종 — backend의 /:name/install·event는 포스트백 수신용이라 조회 endpoint가 없다
	http.get(`${baseURL}/install/:tracker`, () => {
		return HttpResponse.json({ data: [] });
	}),
	http.get(`${baseURL}/event/:tracker`, () => {
		return HttpResponse.json({ data: [] });
	}),
	http.get(`${baseURL}/unregistered/:tracker`, () => {
		return HttpResponse.json({ data: [] });
	}),

	// 엑셀 다운로드 — backend에 없다
	http.get(`${baseURL}/:eventType/:tracker/excel`, () => {
		return HttpResponse.json({ data: [] });
	}),

	// developer 화면의 사용자 생성 — backend의 POST /auth/signup은 이메일 인증 플로우라 다른 기능이다
	http.post(`${baseURL}/users`, () => {
		return HttpResponse.json({ data: null });
	}),
];
