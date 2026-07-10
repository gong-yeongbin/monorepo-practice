// TrackingConsumer가 onModuleInit에서 tracking 스트림을 use-case로 연결하는지 검증
import { TrackingConsumer } from './tracking.consumer';
import { StreamConsumer } from '@infra/stream/stream-consumer.service';
import { TrackingConsumerUseCase } from '@tracking/application/tracking-consumer.use-case';

describe('TrackingConsumer', () => {
	const useCase = { execute: jest.fn() } as unknown as TrackingConsumerUseCase;
	const streamConsumer = { register: jest.fn() } as unknown as StreamConsumer;
	const consumer = new TrackingConsumer(useCase, streamConsumer);

	beforeEach(() => jest.clearAllMocks());

	it("'tracking' 스트림에 핸들러를 등록하고 핸들러는 use-case로 위임한다", () => {
		consumer.onModuleInit();

		expect(streamConsumer.register).toHaveBeenCalledWith('tracking', expect.any(Function));

		const handler = (streamConsumer.register as jest.Mock).mock.calls[0][1];
		handler(['vc1', 'vc2']);
		expect(useCase.execute).toHaveBeenCalledWith(['vc1', 'vc2']);
	});
});
