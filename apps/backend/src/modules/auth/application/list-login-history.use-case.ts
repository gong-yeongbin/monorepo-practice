// 로그인 기록 목록(최신순·페이징)을 조회하고 각 기록의 user_agent를 브라우저·OS·기기 종류로 해석해 덧붙이는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { LoginHistoryListPage } from '@auth/domain/login-history.entity';
import { LOGIN_HISTORY_REPOSITORY, LoginHistoryRepository } from '@auth/domain/login-history.repository';
import { ListLoginHistoryDto } from '@auth/application/dto/list-login-history.dto';
import { parseUserAgent } from '@auth/application/user-agent.parser';

@Injectable()
export class ListLoginHistoryUseCase {
	constructor(@Inject(LOGIN_HISTORY_REPOSITORY) private readonly loginHistoryRepository: LoginHistoryRepository) {}

	async execute(dto: ListLoginHistoryDto): Promise<LoginHistoryListPage> {
		const page = await this.loginHistoryRepository.list({ user_id: dto.user_id, offset: dto.offset, limit: dto.limit });
		return { items: page.items.map((item) => ({ ...item, ...parseUserAgent(item.user_agent) })), total: page.total };
	}
}
