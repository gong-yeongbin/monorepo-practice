import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@auth/presentation/public.decorator';

@ApiTags('health')
// LB 헬스체크가 호출하므로 무인증으로 연다
@Public()
@Controller()
export class AppController {
	@Get('health')
	@ApiOperation({ summary: '헬스체크' })
	@ApiResponse({ status: 200, description: '정상 — { status: "ok" } 반환' })
	health() {
		return { status: 'ok' };
	}
}
