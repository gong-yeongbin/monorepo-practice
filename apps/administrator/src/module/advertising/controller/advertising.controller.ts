import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CreateAdvertisingUseCase, GetAdvertisingUseCase, UpdateAdvertisingUseCase } from '@module/advertising/use-case';
import { CreateAdvertisingDto, UpdateAdvertisingDto } from '@module/advertising/dto/request';
import { AdvertisingIdDto } from '@module/advertising/dto/advertising-id.dto';
import { AccessTokenValidatorGuard } from '@common/guard';

@Controller('advertising')
@UseGuards(AccessTokenValidatorGuard)
export class AdvertisingController {
	constructor(
		private readonly createAdvertisingUseCase: CreateAdvertisingUseCase,
		private readonly updateAdvertisingUseCase: UpdateAdvertisingUseCase,
		private readonly getAdvertisingUseCase: GetAdvertisingUseCase
	) {}

	@Get()
	async gets() {
		return await this.getAdvertisingUseCase.execute();
	}

	@Post()
	async create(@Body() body: CreateAdvertisingDto) {
		return await this.createAdvertisingUseCase.execute(body);
	}

	@Put(':id')
	async update(@Param() param: AdvertisingIdDto, @Body() body: UpdateAdvertisingDto) {
		return await this.updateAdvertisingUseCase.execute(parseInt(param.id), body);
	}
}
