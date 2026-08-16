// ReservationController가 각 라우트를 대응 use-case에 위임하는지 검증
import { ReservationController } from './reservation.controller';
import { CreateReservationUseCase } from '@reservation/application/create-reservation.use-case';
import { ListReservationsUseCase } from '@reservation/application/list-reservations.use-case';
import { DeleteReservationUseCase } from '@reservation/application/delete-reservation.use-case';

describe('ReservationController', () => {
	const create = { execute: jest.fn() } as unknown as CreateReservationUseCase;
	const list = { execute: jest.fn() } as unknown as ListReservationsUseCase;
	const del = { execute: jest.fn() } as unknown as DeleteReservationUseCase;
	const controller = new ReservationController(create, list, del);

	beforeEach(() => jest.clearAllMocks());

	it('create는 body를 위임한다', async () => {
		const body = { name: 'n', tracking_url: 'u', reserved_at: '2026-08-20 10:00:00', campaign_ids: [1] };
		await controller.create(body);
		expect(create.execute).toHaveBeenCalledWith(body);
	});

	it('list는 advertisingId를 위임한다', async () => {
		await controller.list({ advertisingId: 1 });
		expect(list.execute).toHaveBeenCalledWith(1);
	});

	it('delete는 id를 위임한다', async () => {
		await controller.delete({ id: 3 });
		expect(del.execute).toHaveBeenCalledWith(3);
	});
});
