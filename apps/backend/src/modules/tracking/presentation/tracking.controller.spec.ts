// TrackingController가 tracking 요청을 use-case에 위임하고 바디 없는 302로 응답하는지 검증
import { Response } from 'express';
import { TrackingController } from './tracking.controller';
import { TrackingUseCase } from '@tracking/application/tracking.use-case';
import { QueryDto } from '@tracking/application/dto/query.dto';

describe('TrackingController', () => {
	const trackingUseCase = { execute: jest.fn() } as unknown as TrackingUseCase;
	const controller = new TrackingController(trackingUseCase);

	beforeEach(() => jest.clearAllMocks());

	it('use-case 결과 url로 바디 없는 302 리다이렉트를 보낸다', async () => {
		(trackingUseCase.execute as jest.Mock).mockResolvedValue('https://redirect.example.com');
		const query = { token: 'token-1', clickId: 'click-1' } as QueryDto;
		const res = { writeHead: jest.fn(), end: jest.fn() } as unknown as Response;

		await controller.tracking(query, res);

		expect(trackingUseCase.execute).toHaveBeenCalledWith(query);
		expect(res.writeHead).toHaveBeenCalledWith(302, { Location: 'https://redirect.example.com' });
		expect(res.end).toHaveBeenCalledWith();
	});
});
