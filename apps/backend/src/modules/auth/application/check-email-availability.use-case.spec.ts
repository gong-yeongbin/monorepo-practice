// 이메일 사용 가능 여부 조회 use-case의 available true·false 경로를 검증
import { Test } from '@nestjs/testing';
import { CheckEmailAvailabilityUseCase } from './check-email-availability.use-case';
import { USER_REPOSITORY } from '@user/domain/user.repository';

describe('CheckEmailAvailabilityUseCase', () => {
	const userRepository = { findByEmail: jest.fn() };
	let useCase: CheckEmailAvailabilityUseCase;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [CheckEmailAvailabilityUseCase, { provide: USER_REPOSITORY, useValue: userRepository }],
		}).compile();

		useCase = module.get(CheckEmailAvailabilityUseCase);
	});

	it('가입되지 않은 email이면 available true를 반환한다', async () => {
		userRepository.findByEmail.mockResolvedValue(null);

		expect(await useCase.execute('new@example.com')).toEqual({ available: true });
		expect(userRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
	});

	it('이미 가입된 email이면 available false를 반환한다', async () => {
		userRepository.findByEmail.mockResolvedValue({ id: 1, email: 'dup@example.com' });

		expect(await useCase.execute('dup@example.com')).toEqual({ available: false });
	});
});
