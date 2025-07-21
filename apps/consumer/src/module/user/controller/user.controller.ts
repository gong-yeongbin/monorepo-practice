import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../dto';
import { CreateUserUseCase } from '../use-case';

@Controller('user')
export class UserController {
	constructor(private readonly createUserUseCase: CreateUserUseCase) {}

	@Post()
	async create(@Body() body: CreateUserDto) {
		await this.createUserUseCase.execute(body);
	}
}
