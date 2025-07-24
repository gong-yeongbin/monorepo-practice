import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CreateAdvertiserDto, UpdateAdvertiserDto } from '../dto/request';
import { CreateAdvertiserUseCase, GetAdvertiserListUseCase, UpdateAdvertiserUseCase } from '../use-case';
import { AccessTokenValidatorGuard } from '../../../common/guard';
import { AdvertiserIdDto } from '../shared/dto';

@UseGuards(AccessTokenValidatorGuard)
@Controller('advertiser')
export class AdvertiserController {
	constructor(
		private readonly createAdvertiserUseCase: CreateAdvertiserUseCase,
		private readonly updateAdvertiserUseCase: UpdateAdvertiserUseCase,
		private readonly getAdvertiserListUseCase: GetAdvertiserListUseCase
	) {}

	@Post()
	async create(@Body() body: CreateAdvertiserDto) {
		return await this.createAdvertiserUseCase.execute(body.name);
	}

	@Put(':id')
	async update(@Param() param: AdvertiserIdDto, @Body() body: UpdateAdvertiserDto) {
		return await this.updateAdvertiserUseCase.execute(parseInt(param.id), body);
	}

	@Get('list')
	async list() {
		return await this.getAdvertiserListUseCase.execute();
	}
}
