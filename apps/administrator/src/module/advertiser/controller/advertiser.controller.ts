import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateAdvertiserDto } from '@module/advertiser/dto/request';
import { CreateAdvertiserUseCase, GetAdvertiserListUseCase } from '@module/advertiser/use-case';
import { AccessTokenValidatorGuard } from '@common/guard';

@Controller('advertiser')
@UseGuards(AccessTokenValidatorGuard)
export class AdvertiserController {
	constructor(
		private readonly createAdvertiserUseCase: CreateAdvertiserUseCase,
		private readonly getAdvertiserListUseCase: GetAdvertiserListUseCase
	) {}

	@Post()
	async post(@Body() body: CreateAdvertiserDto) {
		return await this.createAdvertiserUseCase.execute(body.name);
	}

	@Get()
	async gets() {
		return await this.getAdvertiserListUseCase.execute();
	}
}
