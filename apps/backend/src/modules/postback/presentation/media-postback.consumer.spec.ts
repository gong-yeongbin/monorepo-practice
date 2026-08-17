// MediaPostbackConsumer가 onModuleInit에서 media-postback 스트림을 use-case로 연결하는지 검증
import { MediaPostbackConsumer } from './media-postback.consumer';
import { StreamConsumer } from '@infra/stream/stream-consumer.service';
import { SendMediaPostbackUseCase } from '@postback/application/send-media-postback.use-case';

describe('MediaPostbackConsumer', () => {
	const useCase = { execute: jest.fn() } as unknown as SendMediaPostbackUseCase;
	const streamConsumer = { register: jest.fn() } as unknown as StreamConsumer;
	const consumer = new MediaPostbackConsumer(useCase, streamConsumer);

	beforeEach(() => jest.clearAllMocks());

	it("'media-postback' 스트림에 핸들러를 등록하고 핸들러는 use-case로 위임한다", () => {
		consumer.onModuleInit();

		expect(streamConsumer.register).toHaveBeenCalledWith('media-postback', expect.any(Function));

		const handler = (streamConsumer.register as jest.Mock).mock.calls[0][1];
		handler(['m1', 'm2']);
		expect(useCase.execute).toHaveBeenCalledWith(['m1', 'm2']);
	});
});
