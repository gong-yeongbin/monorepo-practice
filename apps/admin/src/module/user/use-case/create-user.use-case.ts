import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateUserInput } from '@module/user/dto/request';
import { User } from '@module/user/dto/response';
import { CreateUserDto } from '@module/user/dto/create-user.dto';
import { USER_REPOSITORY } from '@module/user/domain/symbol';
import { IUser } from '@module/user/domain/repositories';

@Injectable()
export class CreateUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUser) {}

	async execute(input: CreateUserInput) {
		const { userId, password, role } = input;
		const salt = 'TEST SALT';

		const user = await this.userRepository.find(userId);
		if (user) throw new ConflictException();

		const userDto = plainToInstance(CreateUserDto, { userId, password, role, salt });
		const result = await this.userRepository.create(userDto);

		return plainToInstance(User, result, { excludeExtraneousValues: true });
	}
}
