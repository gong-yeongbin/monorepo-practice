import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { Postback, PostbackLog } from '@postback/domain/postback.entity';
import { PostbackLogFilter, PostbackRepository, UnregisteredCount } from '@postback/domain/postback.repository';

// 로그 조회 select 목록(raw_query_params 제외 — 무겁고 화면에서 안 씀)
const LOG_SELECT = {
	tracker_name: true, event_name: true, click_id: true, pub_id: true, sub_id: true, view_code: true, token: true,
	adid: true, idfa: true, ip: true, country_code: true, clicked_at: true, installed_at: true, evented_at: true,
	media_sent_at: true, revenue_currency: true, revenue: true,
} as const;

@Injectable()
export class PrismaPostbackRepository implements PostbackRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async createMany(postbacks: Postback[]): Promise<void> {
		await this.prismaService.postback.createMany({ data: postbacks });
	}

	// install 포스트백은 수신 시 event_name='install'로 저장된다(install-postback.use-case)
	async findInstalls(filter: PostbackLogFilter): Promise<PostbackLog[]> {
		return this.prismaService.postback.findMany({
			where: {
				event_name: 'install',
				...(filter.token && { token: filter.token }),
				...(filter.view_code && { view_code: filter.view_code }),
				installed_at: { gte: filter.start, lt: filter.end },
			},
			select: LOG_SELECT,
			orderBy: { installed_at: 'desc' },
		});
	}

	// event_name은 트래커 원본 이벤트명이므로 호출부(use-case)가 campaign_config로 변환해 넘긴다
	async findEvents(filter: PostbackLogFilter, tracker_event_names: string[]): Promise<PostbackLog[]> {
		return this.prismaService.postback.findMany({
			where: {
				event_name: { in: tracker_event_names },
				...(filter.token && { token: filter.token }),
				...(filter.view_code && { view_code: filter.view_code }),
				evented_at: { gte: filter.start, lt: filter.end },
			},
			select: LOG_SELECT,
			orderBy: { evented_at: 'desc' },
		});
	}

	// campaign_config에 없는 이벤트명을 그룹 카운트(consumer의 unregistered 판정과 동일 규칙)
	async countUnregistered(token: string, registered_event_names: string[], start: Date, end: Date): Promise<UnregisteredCount[]> {
		const rows = await this.prismaService.postback.groupBy({
			by: ['event_name'],
			where: { token, event_name: { notIn: registered_event_names }, evented_at: { gte: start, lt: end } },
			_count: { _all: true },
		});

		return rows.map((row) => ({ event_name: row.event_name, count: row._count._all }));
	}
}
