// 포스트백 저장 repository 인터페이스와 DI 토큰
import { Postback } from '@postback/domain/postback.entity';

export const POSTBACK_REPOSITORY = Symbol('POSTBACK_REPOSITORY');

export interface PostbackRepository {
	createMany(postbacks: Postback[]): Promise<void>;
}
