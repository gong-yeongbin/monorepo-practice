import { Module } from '@nestjs/common';
import { ReservationController } from '@reservation/presentation/reservation.controller';
import { CreateReservationUseCase } from '@reservation/application/create-reservation.use-case';
import { ListReservationsUseCase } from '@reservation/application/list-reservations.use-case';
import { DeleteReservationUseCase } from '@reservation/application/delete-reservation.use-case';
import { RESERVATION_REPOSITORY } from '@reservation/domain/reservation.repository';
import { PrismaReservationRepository } from '@reservation/infrastructure/prisma-reservation.repository';

@Module({
	controllers: [ReservationController],
	providers: [
		CreateReservationUseCase,
		ListReservationsUseCase,
		DeleteReservationUseCase,
		{ provide: RESERVATION_REPOSITORY, useClass: PrismaReservationRepository },
	],
})
export class ReservationModule {}
