import { Body, Controller, Post } from '@nestjs/common';
import { CreateTrackerDto } from '../dto/request';
import { CreateTrackerUseCase } from '../use-case';

@Controller('tracker')
export class TrackerController {
	constructor(private readonly createTrackerUseCase: CreateTrackerUseCase) {}

	@Post()
	async create(@Body() body: CreateTrackerDto) {
		return await this.createTrackerUseCase.execute(body);
	}
}
