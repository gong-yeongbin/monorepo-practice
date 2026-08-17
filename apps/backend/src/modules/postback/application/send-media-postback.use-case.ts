// media-postback 스트림 메시지를 받아 매체로 GET 전송하고, 성공 시 media_sent_at을 갱신하는 use-case
import { Inject, Injectable, Logger } from '@nestjs/common';
import { HTTP_PORT, HttpPort } from '@infra/http/http.port';
import { StreamProducer } from '@infra/stream/stream-producer.service';
import { POSTBACK_REPOSITORY, PostbackRepository } from '@postback/domain/postback.repository';
import { MEDIA_POSTBACK_MAX_ATTEMPTS, MEDIA_POSTBACK_STREAM, MediaPostbackMessage } from '@postback/domain/media-postback';

const MEDIA_POSTBACK_TIMEOUT_MS = 5000;

@Injectable()
export class SendMediaPostbackUseCase {
	private readonly logger = new Logger(SendMediaPostbackUseCase.name);

	constructor(
		@Inject(HTTP_PORT) private readonly httpPort: HttpPort,
		@Inject(POSTBACK_REPOSITORY) private readonly postbackRepository: PostbackRepository,
		private readonly producer: StreamProducer
	) {}

	async execute(messages: string[]) {
		const targets = messages.map((message) => this.parse(message)).filter((target): target is MediaPostbackMessage => target !== null);

		// 개별 전송·갱신 실패가 배치 내 다른 건을 막지 않도록 격리한다
		const results = await Promise.allSettled(targets.map((target) => this.send(target)));
		results.forEach((result, index) => {
			// index는 targets.map에서 나오므로 항상 유효하다
			if (result.status === 'rejected') this.logger.error(`매체 포스트백 처리 실패: url=${targets[index]!.url}, ${result.reason}`);
		});
	}

	private async send(target: MediaPostbackMessage): Promise<void> {
		let detail: string;
		try {
			const response = await this.httpPort.get(target.url, { timeoutMs: MEDIA_POSTBACK_TIMEOUT_MS });
			if (response.ok) {
				await this.postbackRepository.updateMediaSentAt(target.postback_id, new Date());
				return;
			}
			detail = `status=${response.status}`;
		} catch (error) {
			detail = `reason=${error}`;
		}

		if (target.attempt + 1 < MEDIA_POSTBACK_MAX_ATTEMPTS) {
			await this.producer.send(MEDIA_POSTBACK_STREAM, JSON.stringify({ ...target, attempt: target.attempt + 1 }));
		} else {
			this.logger.warn(`매체 포스트백 전송 포기(총 ${MEDIA_POSTBACK_MAX_ATTEMPTS}회 실패): url=${target.url}, ${detail}`);
		}
	}

	private parse(value: string): MediaPostbackMessage | null {
		try {
			return JSON.parse(value) as MediaPostbackMessage;
		} catch {
			this.logger.error(`media-postback 메시지 파싱에 실패해 건너뜁니다: ${value}`);
			return null;
		}
	}
}
