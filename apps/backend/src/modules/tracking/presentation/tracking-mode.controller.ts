// 트래킹 수용 모드를 어드민에서 조회·변경하는 컨트롤러
import { Body, Controller, Get, Patch, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TrackingModeUseCase } from '@tracking/application/tracking-mode.use-case';
import { ChangeTrackingModeDto } from '@tracking/application/dto/change-tracking-mode.dto';
import { TrackingModeResponse } from '@tracking/presentation/dto/tracking-mode.response.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { ApiWrappedResponse } from '@interceptors/api-wrapped-response.decorator';
import { Roles } from '@auth/presentation/roles.decorator';

// 부모 없는 싱글턴 리소스라 복수형을 쓰지 않는다(modules/CLAUDE.md의 허용 예외).
// 트래킹 포트에는 노출되지 않는다 — main.ts의 TRACKING_PUBLIC_PATHS가 막는다.
@ApiTags('tracking-mode')
@Roles('DEVELOPER')
@Controller('tracking-mode')
@UseInterceptors(ResponseInterceptor)
export class TrackingModeController {
	constructor(private readonly trackingModeUseCase: TrackingModeUseCase) {}

	@Get()
	@ApiOperation({ summary: '현재 트래킹 수용 모드 조회' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: TrackingModeResponse })
	async read(): Promise<TrackingModeResponse> {
		return { mode: await this.trackingModeUseCase.read() };
	}

	@Patch()
	@ApiOperation({ summary: '트래킹 수용 모드 변경 — closed면 클릭을 전부 503으로 막고, half면 평균 절반만 통과시킨다' })
	@ApiWrappedResponse({ status: 200, description: '변경 성공' })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	async change(@Body() body: ChangeTrackingModeDto): Promise<void> {
		await this.trackingModeUseCase.change(body.mode);
	}
}
