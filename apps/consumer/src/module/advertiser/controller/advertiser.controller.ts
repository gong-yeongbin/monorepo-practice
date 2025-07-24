import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateAdvertiserDto } from '../dto/request';
import { CreateAdvertiserUseCase } from '../use-case';
import { AccessTokenValidatorGuard } from '../../../common/guard';

@UseGuards(AccessTokenValidatorGuard)
@Controller('advertiser')
export class AdvertiserController {
	constructor(private readonly createAdvertiserUseCase: CreateAdvertiserUseCase) {}

	@Post()
	async create(@Body() body: CreateAdvertiserDto) {
		return await this.createAdvertiserUseCase.execute(body.name);
	}
}
