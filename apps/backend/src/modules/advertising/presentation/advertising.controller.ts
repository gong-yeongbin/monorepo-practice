// advertising CRUD와 통계 조회를 처리하는 컨트롤러
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { CreateAdvertisingUseCase } from '@advertising/application/create-advertising.use-case';
import { ListAdvertisingUseCase } from '@advertising/application/list-advertising.use-case';
import { GetAdvertisingUseCase } from '@advertising/application/get-advertising.use-case';
import { UpdateAdvertisingUseCase } from '@advertising/application/update-advertising.use-case';
import { DeleteAdvertisingUseCase } from '@advertising/application/delete-advertising.use-case';
import { CreateAdvertisingDto } from '@advertising/application/dto/create-advertising.dto';
import { UpdateAdvertisingDto } from '@advertising/application/dto/update-advertising.dto';
import { ListAdvertisingDto } from '@advertising/application/dto/list-advertising.dto';
import { AdvertisingIdDto } from '@advertising/application/dto/advertising-id.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@Controller('advertising')
@UseInterceptors(ResponseInterceptor)
export class AdvertisingController {
	constructor(
		private readonly createAdvertisingUseCase: CreateAdvertisingUseCase,
		private readonly listAdvertisingUseCase: ListAdvertisingUseCase,
		private readonly getAdvertisingUseCase: GetAdvertisingUseCase,
		private readonly updateAdvertisingUseCase: UpdateAdvertisingUseCase,
		private readonly deleteAdvertisingUseCase: DeleteAdvertisingUseCase
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

	@Get(':id')
	async get(@Param() param: AdvertisingIdDto) {
		return this.getAdvertisingUseCase.execute(param.id);
	}

	@Put(':id')
	async update(@Param() param: AdvertisingIdDto, @Body() body: UpdateAdvertisingDto) {
		return this.updateAdvertisingUseCase.execute(param.id, body);
	}

	@Delete(':id')
	async delete(@Param() param: AdvertisingIdDto): Promise<void> {
		await this.deleteAdvertisingUseCase.execute(param.id);
	}
}
