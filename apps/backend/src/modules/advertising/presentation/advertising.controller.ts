// advertising CRUD와 통계 조회를 처리하는 컨트롤러
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateAdvertisingUseCase } from '@advertising/application/create-advertising.use-case';
import { ListAdvertisingUseCase } from '@advertising/application/list-advertising.use-case';
import { BriefAdvertisingUseCase } from '@advertising/application/brief-advertising.use-case';
import { InfoAdvertisingUseCase } from '@advertising/application/info-advertising.use-case';
import { DeactivateAdvertisingUseCase } from '@advertising/application/deactivate-advertising.use-case';
import { CreateAdvertisingDto } from '@advertising/application/dto/create-advertising.dto';
import { ListAdvertisingDto } from '@advertising/application/dto/list-advertising.dto';
import { AdvertisingIdDto } from '@advertising/application/dto/advertising-id.dto';
import { JwtAuthGuard } from '@auth/presentation/jwt-auth.guard';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@Controller('advertising')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
export class AdvertisingController {
	constructor(
		private readonly createAdvertisingUseCase: CreateAdvertisingUseCase,
		private readonly listAdvertisingUseCase: ListAdvertisingUseCase,
		private readonly briefAdvertisingUseCase: BriefAdvertisingUseCase,
		private readonly infoAdvertisingUseCase: InfoAdvertisingUseCase,
		private readonly deactivateAdvertisingUseCase: DeactivateAdvertisingUseCase
	) {}

	// admin 원본은 @Put이었으나 REST 표준대로 POST로 이관한다.
	@Post()
	async create(@Body() body: CreateAdvertisingDto) {
		return this.createAdvertisingUseCase.execute(body);
	}

	@Get()
	async list(@Query() query: ListAdvertisingDto) {
		return this.listAdvertisingUseCase.execute(query);
	}

	// ── 정적 경로는 :id 파라미터보다 먼저 선언해야 올바로 매칭된다 ──

	@Get('list')
	async brief() {
		return this.briefAdvertisingUseCase.execute();
	}

	// ── :id 파라미터 경로 ──

	@Get(':id')
	async info(@Param() param: AdvertisingIdDto) {
		return this.infoAdvertisingUseCase.execute(param.id);
	}

	// admin 원본은 status 토글이었으나 status 컬럼이 없어 딸린 campaign 전부 비활성화로 재해석한다.
	@Patch(':id')
	async deactivate(@Param() param: AdvertisingIdDto): Promise<void> {
		await this.deactivateAdvertisingUseCase.execute(param.id);
	}
}
