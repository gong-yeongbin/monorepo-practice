import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
	@Get('health')
	@ApiOperation({ summary: '헬스체크' })
	@ApiResponse({ status: 200, description: '정상 — { status: "ok" } 반환' })
	health() {
		return { status: 'ok' };
	}
}
