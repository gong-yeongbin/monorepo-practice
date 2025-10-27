import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateAdvertiserDto, PatchAdvertiserDto } from '@module/advertiser/dto/request';
import { CreateAdvertiserUseCase, GetAdvertiserListUseCase, PatchAdvertiserUseCase } from '@module/advertiser/use-case';
import { AccessTokenValidatorGuard } from '@common/guard';
import { AdvertiserIdDto } from '@module/advertiser/dto/advertiser-id.dto';

@Controller('advertiser')
@UseGuards(AccessTokenValidatorGuard)
export class AdvertiserController {
	constructor(
		private readonly createAdvertiserUseCase: CreateAdvertiserUseCase,
		private readonly getAdvertiserListUseCase: GetAdvertiserListUseCase,
		private readonly patchAdvertiserUseCase: PatchAdvertiserUseCase
	) {}

	@Get()
	async gets() {
		return await this.getAdvertiserListUseCase.execute();
	}

	@Post()
	async post(@Body() body: CreateAdvertiserDto) {
		return await this.createAdvertiserUseCase.execute(body.name);
	}

	@Patch(':id')
	async update(@Param() param: AdvertiserIdDto, @Body() body: PatchAdvertiserDto) {
		return await this.patchAdvertiserUseCase.execute(param.id, body.name);
	}
}
