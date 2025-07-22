import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../dto';
import { CreateUserUseCase } from '../use-case';
import { AccessTokenValidatorGuard } from '../../../common/guard';

@Controller('user')
export class UserController {
	constructor(private readonly createUserUseCase: CreateUserUseCase) {}

	@UseGuards(AccessTokenValidatorGuard)
	@Post()
	async create(@Body() body: CreateUserDto) {
		await this.createUserUseCase.execute(body);
	}
}
