// 로그인 기록 응답 스키마(Swagger 문서용). 도메인 타입과 필드를 동일하게 유지한다
import { ApiProperty } from '@nestjs/swagger';
import { LOGIN_RESULTS, LoginHistoryListItem, LoginHistoryListPage, LoginResult } from '@auth/domain/login-history.entity';

export class LoginHistoryListItemResponse implements LoginHistoryListItem {
	id: number;

	// 없는 email로 시도했거나 이후 user가 삭제되면 null
	user_id: number | null;

	// 입력된 email 그대로
	email: string;

	@ApiProperty({ enum: [...LOGIN_RESULTS] })
	result: LoginResult;

	ip: string;

	// 원문
	user_agent: string | null;

	created_at: Date;

	// 아래 셋은 user_agent를 조회 시점에 해석한 값. 기기 모델까지는 알 수 없다
	browser: string | null;

	os: string | null;

	device_type: string;
}

export class LoginHistoryListPageResponse implements LoginHistoryListPage {
	items: LoginHistoryListItemResponse[];

	// 조건에 맞는 전체 건수(페이지네이션 계산용)
	total: number;
}
