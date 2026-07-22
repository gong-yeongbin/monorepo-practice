import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
	@Get('health')
	@ApiOperation({ summary: '헬스체크' })
	health() {
		return { status: 'ok' };
	}
}
