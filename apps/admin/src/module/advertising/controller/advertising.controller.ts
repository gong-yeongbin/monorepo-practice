import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CreateAdvertisingUseCase, GetAdvertisingListUseCase, GetAdvertisingUseCase, GetCampaignListUseCase, UpdateAdvertisingUseCase } from '@module/advertising/use-case';
import { CreateAdvertisingDto, UpdateAdvertisingDto } from '@module/advertising/dto/request';
import { AccessTokenValidatorGuard } from '@common/guard';
import { AdvertisingIdDto, AdvertisingNameDto } from '@advertising/dto';

@Controller('advertising')
@UseGuards(AccessTokenValidatorGuard)
export class AdvertisingController {
	constructor(
		private readonly createAdvertisingUseCase: CreateAdvertisingUseCase,
		private readonly updateAdvertisingUseCase: UpdateAdvertisingUseCase,
		private readonly getAdvertisingListUseCase: GetAdvertisingListUseCase,
		private readonly getCampaignListUseCase: GetCampaignListUseCase,
		private readonly getAdvertisingUseCase: GetAdvertisingUseCase
	) {}

	@Get()
	async list() {
		return await this.getAdvertisingListUseCase.execute();
	}

	@Get(':name')
	async getByName(@Param() param: AdvertisingNameDto) {
		return await this.getAdvertisingUseCase.execute(param.name);
	}

	@Get(':id/campaign')
	async getById(@Param() param: AdvertisingIdDto) {
		return await this.getCampaignListUseCase.execute(parseInt(param.id));
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
