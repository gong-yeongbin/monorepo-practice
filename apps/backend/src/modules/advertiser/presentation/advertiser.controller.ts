// advertiser 목록 조회·생성을 처리하는 컨트롤러
import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ListAdvertiserUseCase } from '@advertiser/application/list-advertiser.use-case';
import { CreateAdvertiserUseCase } from '@advertiser/application/create-advertiser.use-case';
import { CreateAdvertiserDto } from '@advertiser/application/dto/create-advertiser.dto';
import { JwtAuthGuard } from '@auth/presentation/jwt-auth.guard';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@Controller('advertiser')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
export class AdvertiserController {
	constructor(
		private readonly listAdvertiserUseCase: ListAdvertiserUseCase,
		private readonly createAdvertiserUseCase: CreateAdvertiserUseCase
	) {}

	@Get()
	async get() {
		return this.listAdvertiserUseCase.execute();
	}

	// admin 원본은 @Put + @Query였으나(주석에 Put->Post 의도 명시) REST 표준대로 POST + body로 이관한다.
	@Post()
	async create(@Body() body: CreateAdvertiserDto) {
		return this.createAdvertiserUseCase.execute(body);
	}
}
