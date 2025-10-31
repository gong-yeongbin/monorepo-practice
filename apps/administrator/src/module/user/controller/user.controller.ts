import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateUserUseCase } from '@module/user/use-case';
import { CreateUserDto } from '@module/user/dto/request';
import { AccessTokenValidatorGuard } from '@common/guard';

@Controller('user')
@UseGuards(AccessTokenValidatorGuard)
export class UserController {
	constructor(private readonly createUserUseCase: CreateUserUseCase) {}

	@Post()
	async create(@Body() body: CreateUserDto) {
		return await this.createUserUseCase.execute(body);
	}
}
