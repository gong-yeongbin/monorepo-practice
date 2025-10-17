import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { AdIdDto } from '@module/ad/shared/dto/ad-id.dto';
import { CreateAdUseCase, UpdateAdUseCase } from '@module/ad/use-case';
import { CreateAdDto, UpdateAdDto } from '@module/ad/dto/request';

@Controller('ad')
export class AdController {
	constructor(
		private readonly createAdUseCase: CreateAdUseCase,
		private readonly updateAdUseCase: UpdateAdUseCase
	) {}

	@Post()
	async create(@Body() body: CreateAdDto) {
		return await this.createAdUseCase.execute(body);
	}

	@Put(':id')
	async update(@Param() param: AdIdDto, @Body() body: UpdateAdDto) {
		return await this.updateAdUseCase.execute(parseInt(param.id), body);
	}
}
