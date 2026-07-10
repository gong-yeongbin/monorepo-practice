// PostbackConsumer가 onModuleInit에서 postback 스트림을 use-case로 연결하는지 검증
import { PostbackConsumer } from './postback.consumer';
import { StreamConsumer } from '@infra/stream/stream-consumer.service';
import { PostbackConsumerUseCase } from '@postback/application/postback-consumer.use-case';

describe('PostbackConsumer', () => {
	const useCase = { execute: jest.fn() } as unknown as PostbackConsumerUseCase;
	const streamConsumer = { register: jest.fn() } as unknown as StreamConsumer;
	const consumer = new PostbackConsumer(useCase, streamConsumer);

	beforeEach(() => jest.clearAllMocks());

	it("'postback' 스트림에 핸들러를 등록하고 핸들러는 use-case로 위임한다", () => {
		consumer.onModuleInit();

		expect(streamConsumer.register).toHaveBeenCalledWith('postback', expect.any(Function));

		const handler = (streamConsumer.register as jest.Mock).mock.calls[0][1];
		handler(['m1', 'm2']);
		expect(useCase.execute).toHaveBeenCalledWith(['m1', 'm2']);
	});
});
