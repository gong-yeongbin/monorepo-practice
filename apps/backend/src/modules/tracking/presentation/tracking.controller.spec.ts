// TrackingController가 tracking 요청을 use-case에 위임하고 리다이렉트 url을 반환하는지 검증
import { TrackingController } from './tracking.controller';
import { TrackingUseCase } from '@tracking/application/tracking.use-case';
import { QueryDto } from '@tracking/application/dto/query.dto';

describe('TrackingController', () => {
	const trackingUseCase = { execute: jest.fn() } as unknown as TrackingUseCase;
	const controller = new TrackingController(trackingUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('use-case 결과 url을 리다이렉트 형태로 반환한다', async () => {
		(trackingUseCase.execute as jest.Mock).mockResolvedValue('https://redirect.example.com');
		const query = { token: 'token-1', clickId: 'click-1' } as QueryDto;

		const result = await controller.tracking(query);

		expect(result).toEqual({ url: 'https://redirect.example.com' });
		expect(trackingUseCase.execute).toHaveBeenCalledWith(query);
	});
});
