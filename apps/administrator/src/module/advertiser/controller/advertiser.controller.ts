import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateAdvertiserDto } from '@module/advertiser/dto/request';
import { CreateAdvertiserUseCase } from '@module/advertiser/use-case';

@Controller('advertiser')
export class AdvertiserController {
	constructor(private readonly createAdvertiserUseCase: CreateAdvertiserUseCase) {}

	@Post()
	async post(@Body() body: CreateAdvertiserDto) {
		return await this.createAdvertiserUseCase.execute(body.name);
	}

	@Get()
	async gets() {
		return;
	}
}
