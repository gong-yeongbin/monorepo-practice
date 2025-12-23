import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { USER_REPOSITORY } from '@user/domain/symbol';
import { IUser } from '@user/domain/repositories';
import { CreateUserDto } from '@user/dto';

@Injectable()
export class ValidateUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUser) {}

	async execute(userId: string, password: string) {
		const user = await this.userRepository.find(userId);

		if (user?.password !== password) return null;

		return plainToInstance(CreateUserDto, user);
	}
}
