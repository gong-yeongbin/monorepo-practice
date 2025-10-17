import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserUseCase } from '@module/user/use-case';
import { CreateUserDto } from '@module/user/dto/request';

@Controller('user')
export class UserController {
	constructor(private readonly createUserUseCase: CreateUserUseCase) {}

	@Post()
	async create(@Body() body: CreateUserDto) {
		return await this.createUserUseCase.execute(body);
	}
}
