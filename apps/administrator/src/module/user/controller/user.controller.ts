import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../dto/request';
import { CreateUserUseCase } from '../use-case';

@Controller('user')
export class UserController {
	constructor(private readonly createUserUseCase: CreateUserUseCase) {}

	@Post()
	async create(@Body() body: CreateUserDto) {
		return await this.createUserUseCase.execute(body);
	}
}
