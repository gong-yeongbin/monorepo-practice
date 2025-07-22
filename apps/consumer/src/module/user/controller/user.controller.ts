import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateUserUseCase } from '../use-case';
import { AccessTokenValidatorGuard } from '../../../common/guard';
import { CreateUserDto } from '../dto/request';

@Controller('user')
export class UserController {
	constructor(private readonly createUserUseCase: CreateUserUseCase) {}

	@UseGuards(AccessTokenValidatorGuard)
	@Post()
	async create(@Body() body: CreateUserDto) {
		return await this.createUserUseCase.execute(body);
	}
}
