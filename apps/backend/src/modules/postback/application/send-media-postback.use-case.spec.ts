import { Test } from '@nestjs/testing';
import { SendMediaPostbackUseCase } from './send-media-postback.use-case';
import { HTTP_PORT } from '@infra/http/http.port';
import { StreamProducer } from '@infra/stream/stream-producer.service';
import { POSTBACK_REPOSITORY } from '@postback/domain/postback.repository';

describe('SendMediaPostbackUseCase', () => {
	const httpPort = { get: jest.fn() };
	const postbackRepository = { updateMediaSentAt: jest.fn() };
	const producer = { send: jest.fn() };
	let useCase: SendMediaPostbackUseCase;

	const message = (overrides: Partial<{ postback_id: number; url: string; attempt: number }> = {}) =>
		JSON.stringify({ postback_id: 1, url: 'https://media.example.com/install?click_id=c1', attempt: 0, ...overrides });

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [
				SendMediaPostbackUseCase,
				{ provide: HTTP_PORT, useValue: httpPort },
				{ provide: POSTBACK_REPOSITORY, useValue: postbackRepository },
				{ provide: StreamProducer, useValue: producer },
			],
		}).compile();

		useCase = module.get(SendMediaPostbackUseCase);
	});

	it('2xx 응답이면 media_sent_at을 갱신하고 재적재하지 않는다', async () => {
		httpPort.get.mockResolvedValue({ ok: true, status: 200 });

		await useCase.execute([message()]);

		expect(httpPort.get).toHaveBeenCalledWith('https://media.example.com/install?click_id=c1', { timeoutMs: 5000 });
		expect(postbackRepository.updateMediaSentAt).toHaveBeenCalledWith(1, expect.any(Date));
		expect(producer.send).not.toHaveBeenCalled();
	});

	it('비 2xx 응답이면 attempt를 올려 재적재하고 갱신하지 않는다', async () => {
		httpPort.get.mockResolvedValue({ ok: false, status: 500 });

		await useCase.execute([message()]);

		expect(postbackRepository.updateMediaSentAt).not.toHaveBeenCalled();
		expect(producer.send).toHaveBeenCalledWith('media-postback', JSON.stringify({ postback_id: 1, url: 'https://media.example.com/install?click_id=c1', attempt: 1 }));
	});

	it('전송이 reject(타임아웃·네트워크 오류)돼도 재적재한다', async () => {
		httpPort.get.mockRejectedValue(new Error('timeout'));

		await useCase.execute([message()]);

		expect(producer.send).toHaveBeenCalledWith('media-postback', expect.stringContaining('"attempt":1'));
	});

	it('마지막 시도(attempt=2)까지 실패하면 재적재 없이 포기한다', async () => {
		httpPort.get.mockResolvedValue({ ok: false, status: 502 });

		await useCase.execute([message({ attempt: 2 })]);

		expect(producer.send).not.toHaveBeenCalled();
		expect(postbackRepository.updateMediaSentAt).not.toHaveBeenCalled();
	});

	it('배치 내 실패 건이 있어도 다른 성공 건은 갱신된다', async () => {
		httpPort.get.mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce({ ok: true, status: 200 });

		await useCase.execute([message({ postback_id: 1 }), message({ postback_id: 2 })]);

		expect(postbackRepository.updateMediaSentAt).toHaveBeenCalledTimes(1);
		expect(postbackRepository.updateMediaSentAt).toHaveBeenCalledWith(2, expect.any(Date));
	});

	it('media_sent_at 갱신이 실패해도 예외를 전파하지 않는다', async () => {
		httpPort.get.mockResolvedValue({ ok: true, status: 200 });
		postbackRepository.updateMediaSentAt.mockRejectedValue(new Error('db down'));

		await expect(useCase.execute([message()])).resolves.toBeUndefined();
	});

	it('깨진 JSON 메시지는 건너뛴다', async () => {
		await useCase.execute(['not-json']);

		expect(httpPort.get).not.toHaveBeenCalled();
		expect(producer.send).not.toHaveBeenCalled();
	});
});
