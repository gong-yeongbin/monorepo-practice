import { Test } from '@nestjs/testing';
import { ApplyDueReservationsUseCase } from './apply-due-reservations.use-case';
import { RESERVATION_REPOSITORY } from '@reservation/domain/reservation.repository';
import { CACHE_PORT } from '@infra/cache/cache.port';

describe('ApplyDueReservationsUseCase', () => {
	const reservationRepository = { findDue: jest.fn(), apply: jest.fn() };
	const cache = { setIfAbsent: jest.fn() };
	let useCase: ApplyDueReservationsUseCase;

	const now = new Date('2026-08-16T01:00:00Z');
	const due = [
		{ id: 1, campaign_id: 1, name: 'a', tracking_url: 'u1', reserved_at: now, is_applied: false },
		{ id: 2, campaign_id: 2, name: 'b', tracking_url: 'u2', reserved_at: now, is_applied: false },
	];

	beforeEach(async () => {
		jest.clearAllMocks();
		// 기본은 락 획득 성공 — 락을 못 얻는 경우만 개별 케이스에서 뒤집는다
		cache.setIfAbsent.mockResolvedValue(true);
		const module = await Test.createTestingModule({
			providers: [
				ApplyDueReservationsUseCase,
				{ provide: RESERVATION_REPOSITORY, useValue: reservationRepository },
				{ provide: CACHE_PORT, useValue: cache },
			],
		}).compile();
		useCase = module.get(ApplyDueReservationsUseCase);
	});

	it('시각이 지난 예약을 전부 적용한다', async () => {
		reservationRepository.findDue.mockResolvedValue(due);
		reservationRepository.apply.mockResolvedValue(undefined);

		await useCase.execute(now);

		expect(reservationRepository.findDue).toHaveBeenCalledWith(now);
		expect(reservationRepository.apply).toHaveBeenCalledTimes(2);
		expect(reservationRepository.apply).toHaveBeenCalledWith(due[0]);
		expect(reservationRepository.apply).toHaveBeenCalledWith(due[1]);
	});

	it('앞의 적용이 끝난 뒤에 다음 적용을 시작한다 (같은 캠페인의 예약 순서 보장)', async () => {
		reservationRepository.findDue.mockResolvedValue(due);
		let resolveFirst!: () => void;
		reservationRepository.apply
			.mockImplementationOnce(() => new Promise<void>((resolve) => (resolveFirst = resolve)))
			.mockResolvedValueOnce(undefined);

		const pending = useCase.execute(now);
		// 락 획득·findDue의 await를 모두 흘려보낸 뒤 관찰한다
		await new Promise((resolve) => setImmediate(resolve));

		// 첫 적용이 아직 안 끝났으므로 두 번째는 시작되지 않아야 한다
		expect(reservationRepository.apply).toHaveBeenCalledTimes(1);

		resolveFirst();
		await pending;

		expect(reservationRepository.apply).toHaveBeenCalledTimes(2);
	});

	it('한 건 적용 실패가 나머지 적용을 막지 않는다', async () => {
		reservationRepository.findDue.mockResolvedValue(due);
		reservationRepository.apply.mockRejectedValueOnce(new Error('db down')).mockResolvedValueOnce(undefined);

		await expect(useCase.execute(now)).resolves.toBeUndefined();
		expect(reservationRepository.apply).toHaveBeenCalledTimes(2);
	});

	it('적용 대상이 없으면 아무것도 하지 않는다', async () => {
		reservationRepository.findDue.mockResolvedValue([]);

		await useCase.execute(now);

		expect(reservationRepository.apply).not.toHaveBeenCalled();
	});

	it('락을 시 단위 키로 잡는다', async () => {
		reservationRepository.findDue.mockResolvedValue([]);

		await useCase.execute(now);

		expect(cache.setIfAbsent).toHaveBeenCalledWith('reservation-cron:2026-08-16T01', now.toISOString(), 1000 * 60 * 5);
	});

	it('락을 얻지 못하면 조회조차 하지 않는다 (다른 태스크가 이미 실행 중)', async () => {
		cache.setIfAbsent.mockResolvedValue(false);

		await useCase.execute(now);

		expect(reservationRepository.findDue).not.toHaveBeenCalled();
		expect(reservationRepository.apply).not.toHaveBeenCalled();
	});
});
