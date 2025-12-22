import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '@module/user/dto/create-user.dto';
import { USER_REPOSITORY } from '@module/user/domain/symbol';
import { IUser } from '@module/user/domain/repositories';

@Injectable()
export class ValidateUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUser) {}

	async execute(userId: string, password: string) {
		const user = await this.userRepository.find(userId);

		if (user?.password !== password) return null;

		return plainToInstance(CreateUserDto, user);
	}
}
