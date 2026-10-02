// login_history 테이블 Prisma 구현 — 삽입과 최신순 페이징 조회
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { LoginHistoryPage } from '@auth/domain/login-history.entity';
import { CreateLoginHistoryProps, ListLoginHistoryParams, LoginHistoryRepository } from '@auth/domain/login-history.repository';

// user_agent 컬럼 길이(schema.prisma). 비정상적으로 긴 헤더 때문에 로그인 자체가 실패하지 않도록 잘라 넣는다
const USER_AGENT_MAX_LENGTH = 512;

@Injectable()
export class PrismaLoginHistoryRepository implements LoginHistoryRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async create(props: CreateLoginHistoryProps): Promise<void> {
		await this.prismaService.login_history.create({
			data: { ...props, user_agent: props.user_agent === null ? null : props.user_agent.slice(0, USER_AGENT_MAX_LENGTH) },
		});
	}

	async list(params: ListLoginHistoryParams): Promise<LoginHistoryPage> {
		// user_id가 undefined면 Prisma가 조건을 무시해 전체가 조회된다.
		// created_at은 초 단위(Timestamp(0))라 같은 초에 들어온 기록은 id로 순서를 보장한다
		const where = { user_id: params.user_id };
		const [items, total] = await Promise.all([
			this.prismaService.login_history.findMany({ where, orderBy: [{ created_at: 'desc' }, { id: 'desc' }], skip: params.offset, take: params.limit }),
			this.prismaService.login_history.count({ where }),
		]);
		return { items, total };
	}
}
