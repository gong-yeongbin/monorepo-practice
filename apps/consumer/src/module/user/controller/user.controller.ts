import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AccessTokenValidatorGuard } from '../../../common/guard';
import { CreateUserDto } from '../dto/request';
import { CreateUserUseCase } from '../use-case';

@UseGuards(AccessTokenValidatorGuard)
@Controller('user')
export class UserController {
	constructor(private readonly createUserUseCase: CreateUserUseCase) {}

	@Post()
	async create(@Body() body: CreateUserDto) {
		return await this.createUserUseCase.execute(body);
	}
}
