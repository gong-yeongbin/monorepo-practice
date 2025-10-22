import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { CreateAdvertisingUseCase, UpdateAdvertisingUseCase } from '@module/advertising/use-case';
import { CreateAdvertisingDto, UpdateAdvertisingDto } from '@module/advertising/dto/request';
import { AdvertisingIdDto } from '@module/advertising/dto/advertising-id.dto';

@Controller('ad')
export class AdvertisingController {
	constructor(
		private readonly createAdUseCase: CreateAdvertisingUseCase,
		private readonly updateAdUseCase: UpdateAdvertisingUseCase
	) {}

	@Post()
	async create(@Body() body: CreateAdvertisingDto) {
		return await this.createAdUseCase.execute(body);
	}

	@Put(':id')
	async update(@Param() param: AdvertisingIdDto, @Body() body: UpdateAdvertisingDto) {
		return await this.updateAdUseCase.execute(param.id, body);
	}
}
