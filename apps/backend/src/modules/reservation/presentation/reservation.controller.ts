// 예약(상위 트래커 URL 예약 변경) 생성·목록·삭제를 처리하는 컨트롤러
import { Body, Controller, Delete, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateReservationUseCase } from '@reservation/application/create-reservation.use-case';
import { ListReservationsUseCase } from '@reservation/application/list-reservations.use-case';
import { DeleteReservationUseCase } from '@reservation/application/delete-reservation.use-case';
import { CreateReservationDto } from '@reservation/application/dto/create-reservation.dto';
import { ListReservationDto } from '@reservation/application/dto/list-reservation.dto';
import { ReservationIdDto } from '@reservation/application/dto/reservation-id.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { ApiWrappedResponse } from '@interceptors/api-wrapped-response.decorator';
import { ReservationListItemResponse } from '@reservation/presentation/dto/reservation.response.dto';
import { Roles } from '@auth/presentation/roles.decorator';

@ApiTags('reservations')
@Roles('DEVELOPER', 'ADMIN')
@Controller('reservations')
@UseInterceptors(ResponseInterceptor)
export class ReservationController {
	constructor(
		private readonly createReservationUseCase: CreateReservationUseCase,
		private readonly listReservationsUseCase: ListReservationsUseCase,
		private readonly deleteReservationUseCase: DeleteReservationUseCase
	) {}

	// admin 원본은 PUT /reservation이었으나 REST 표준대로 POST 생성으로 이관한다
	@Post()
	@ApiOperation({ summary: '예약 생성 (선택한 campaign마다 예약 행 생성)' })
	@ApiWrappedResponse({ status: 201, description: '생성 성공' })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	@ApiResponse({ status: 404, description: '없는 campaign 포함' })
	async create(@Body() body: CreateReservationDto): Promise<void> {
		await this.createReservationUseCase.execute(body);
	}

	@Get()
	@ApiOperation({ summary: '예약 목록 조회 (advertising 단위 필터)' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: ReservationListItemResponse, isArray: true })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	async list(@Query() query: ListReservationDto) {
		return this.listReservationsUseCase.execute(query.advertisingId);
	}

	@Delete(':id')
	@ApiOperation({ summary: '예약 삭제' })
	@ApiWrappedResponse({ status: 200, description: '삭제 성공' })
	@ApiResponse({ status: 404, description: '예약 없음' })
	async delete(@Param() param: ReservationIdDto): Promise<void> {
		await this.deleteReservationUseCase.execute(param.id);
	}
}
