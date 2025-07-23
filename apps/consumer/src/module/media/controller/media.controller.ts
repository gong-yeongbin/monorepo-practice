import { Body, Controller, Post } from '@nestjs/common';
import { CreateMediaDto } from '../dto/request';
import { CreateMediaUseCase } from '../use-case';

@Controller('media')
export class MediaController {
	constructor(private readonly createMediaUseCase: CreateMediaUseCase) {}

	@Post()
	async create(@Body() body: CreateMediaDto) {
		return await this.createMediaUseCase.execute(body);
	}
}
