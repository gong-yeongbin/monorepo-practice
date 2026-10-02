// 로그인 기록(보안 감사) 조회 컨트롤러
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListLoginHistoryDto } from '@auth/application/dto/list-login-history.dto';
import { ListLoginHistoryUseCase } from '@auth/application/list-login-history.use-case';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { ApiWrappedResponse } from '@interceptors/api-wrapped-response.decorator';
import { LoginHistoryListPageResponse } from '@auth/presentation/dto/login-history.response.dto';
import { Roles } from '@auth/presentation/roles.decorator';

@ApiTags('login-histories')
// 전체 사용자의 로그인 시도(실패 포함)·IP가 보이는 감사 데이터라 DEVELOPER 전용이다
@Roles('DEVELOPER')
@Controller('login-histories')
@UseInterceptors(ResponseInterceptor)
export class LoginHistoryController {
	constructor(private readonly listLoginHistoryUseCase: ListLoginHistoryUseCase) {}

	@Get()
	@ApiOperation({ summary: '로그인 기록 목록 조회 (user_id·offset·limit, 최신순). 전체 건수 total을 함께 반환' })
	@ApiWrappedResponse({ status: 200, description: '조회 성공', type: LoginHistoryListPageResponse })
	@ApiResponse({ status: 400, description: '요청 값 검증 실패' })
	async list(@Query() query: ListLoginHistoryDto) {
		return this.listLoginHistoryUseCase.execute(query);
	}
}
