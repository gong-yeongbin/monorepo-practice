import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { CreateAdDto, UpdateAdDto } from '../dto/request';
import { CreateAdUseCase, UpdateAdUseCase } from '../use-case';
import { AdIdDto } from '../shared/dto/ad-id.dto';

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
