// 로그인 시도 기록 도메인 타입(DB 컬럼과 동일한 snake_case). 보안 감사용으로 성공·실패를 모두 남긴다.
// 값의 단일 출처 — DTO의 Swagger enum도 이 배열을 재사용한다(domain은 Prisma를 모르므로 Prisma enum은 쓰지 않는다)
export const LOGIN_RESULTS = ['SUCCESS', 'INVALID_CREDENTIALS', 'NOT_APPROVED'] as const;
export type LoginResult = (typeof LOGIN_RESULTS)[number];

export interface LoginHistory {
	id: number;
	// 없는 email로 시도했거나 이후 user가 삭제되면 null. email은 입력값 그대로라 그래도 누구였는지 남는다.
	user_id: number | null;
	email: string;
	result: LoginResult;
	ip: string;
	// 원문 그대로. 브라우저·OS 해석은 조회 시점에 한다(LoginHistoryListItem).
	user_agent: string | null;
	created_at: Date;
}

// repository가 돌려주는 페이지: 현재 페이지 항목과 조건에 맞는 전체 건수(페이지네이션 계산용)
export interface LoginHistoryPage {
	items: LoginHistory[];
	total: number;
}

// 조회 응답 항목 — user_agent 원문을 해석한 브라우저·OS·기기 종류를 덧붙인다.
// UA로는 기기 모델까지는 알 수 없다(데스크톱은 전부 'desktop', iPhone은 모델 구분 불가).
export interface LoginHistoryListItem extends LoginHistory {
	browser: string | null;
	os: string | null;
	device_type: string;
}

export interface LoginHistoryListPage {
	items: LoginHistoryListItem[];
	total: number;
}
