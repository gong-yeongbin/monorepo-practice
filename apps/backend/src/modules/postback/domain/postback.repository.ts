// 포스트백 저장·로그 조회 repository 인터페이스와 DI 토큰
import { Postback, PostbackLog } from '@postback/domain/postback.entity';

export const POSTBACK_REPOSITORY = Symbol('POSTBACK_REPOSITORY');

// 어드민 로그 조회 필터. end는 exclusive 경계(다음날 00:00)다.
export interface PostbackLogFilter {
	token?: string;
	view_code?: string;
	start: Date;
	end: Date;
}

// 미등록 이벤트의 이벤트명별 카운트
export interface UnregisteredCount {
	event_name: string;
	count: number;
}

export interface PostbackRepository {
	create(postback: Postback): Promise<number>; // 매체 전송 후 media_sent_at 갱신에 쓸 생성 id 반환
	updateMediaSentAt(id: number, sentAt: Date): Promise<void>;
	findInstalls(filter: PostbackLogFilter): Promise<PostbackLog[]>;
	findEvents(filter: PostbackLogFilter, tracker_event_names: string[]): Promise<PostbackLog[]>;
	countUnregistered(token: string, registered_event_names: string[], start: Date, end: Date): Promise<UnregisteredCount[]>;
}
