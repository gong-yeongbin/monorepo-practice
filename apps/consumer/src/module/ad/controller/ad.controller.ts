import { Body, Controller, Post } from '@nestjs/common';
import { CreateAdDto } from '../dto/request';
import { CreateAdUseCase } from '../use-case';

@Controller('ad')
export class AdController {
	constructor(private readonly createAdUseCase: CreateAdUseCase) {}

	@Post()
	async create(@Body() body: CreateAdDto) {
		return await this.createAdUseCase.execute(body);
	}
}
