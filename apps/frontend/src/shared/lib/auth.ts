// access token payload에서 로그인 사용자(email·role)를 읽는 헬퍼 — 레이아웃 셸과 라우트 가드가 공유한다
export const ROLES = ['DEVELOPER', 'ADMIN', 'USER'] as const;

export type Role = (typeof ROLES)[number];

export interface AuthUser {
	email: string;
	role: Role;
}

// payload는 base64url이라 표준 atob 전에 문자 치환이 필요
export const parseAccessToken = (token: string | null): AuthUser | null => {
	if (!token) return null;
	try {
		return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
	} catch {
		return null;
	}
};

export const getAuthUser = () => parseAccessToken(sessionStorage.getItem('accessToken'));
