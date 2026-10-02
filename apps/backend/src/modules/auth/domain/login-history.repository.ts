// 로그인 기록 생성·조회 repository 인터페이스와 DI 토큰
import { LoginHistoryPage, LoginResult } from '@auth/domain/login-history.entity';

export const LOGIN_HISTORY_REPOSITORY = Symbol('LOGIN_HISTORY_REPOSITORY');

export interface CreateLoginHistoryProps {
	user_id: number | null;
	email: string;
	result: LoginResult;
	ip: string;
	user_agent: string | null;
}

// user_id를 생략하면 전체(최신순). offset·limit은 advertising 목록과 같은 규약이다.
export interface ListLoginHistoryParams {
	user_id?: number;
	offset: number;
	limit: number;
}

export interface LoginHistoryRepository {
	create(props: CreateLoginHistoryProps): Promise<void>;
	list(params: ListLoginHistoryParams): Promise<LoginHistoryPage>;
}
