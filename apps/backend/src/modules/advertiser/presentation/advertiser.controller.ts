// advertiser CRUD를 처리하는 컨트롤러
import { Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { ListAdvertiserUseCase } from '@advertiser/application/list-advertiser.use-case';
import { GetAdvertiserUseCase } from '@advertiser/application/get-advertiser.use-case';
import { CreateAdvertiserUseCase } from '@advertiser/application/create-advertiser.use-case';
import { UpdateAdvertiserUseCase } from '@advertiser/application/update-advertiser.use-case';
import { DeleteAdvertiserUseCase } from '@advertiser/application/delete-advertiser.use-case';
import { CreateAdvertiserDto } from '@advertiser/application/dto/create-advertiser.dto';
import { AdvertiserIdDto } from '@advertiser/application/dto/advertiser-id.dto';
import { ResponseInterceptor } from '@interceptors/response.interceptor';

@Controller('advertiser')
@UseInterceptors(ResponseInterceptor)
export class AdvertiserController {
	constructor(
		private readonly listAdvertiserUseCase: ListAdvertiserUseCase,
		private readonly getAdvertiserUseCase: GetAdvertiserUseCase,
		private readonly createAdvertiserUseCase: CreateAdvertiserUseCase,
		private readonly updateAdvertiserUseCase: UpdateAdvertiserUseCase,
		private readonly deleteAdvertiserUseCase: DeleteAdvertiserUseCase
	) {}

	@Get()
	async list() {
		return this.listAdvertiserUseCase.execute();
	}

	@Get(':id')
	async get(@Param() param: AdvertiserIdDto) {
		return this.getAdvertiserUseCase.execute(param.id);
	}

	// admin 원본은 @Put + @Query였으나(주석에 Put->Post 의도 명시) REST 표준대로 POST + body로 이관한다.
	@Post()
	async create(@Body() body: CreateAdvertiserDto) {
		return this.createAdvertiserUseCase.execute(body);
	}

	@Patch(':id')
	async update(@Param() param: AdvertiserIdDto, @Body() body: CreateAdvertiserDto) {
		return this.updateAdvertiserUseCase.execute(param.id, body);
	}

	@Delete(':id')
	async delete(@Param() param: AdvertiserIdDto): Promise<void> {
		await this.deleteAdvertiserUseCase.execute(param.id);
	}
}
