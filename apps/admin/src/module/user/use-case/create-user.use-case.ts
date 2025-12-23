import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { USER_REPOSITORY } from '@user/domain/symbol';
import { IUser } from '@user/domain/repositories';
import { CreateUserInput } from '@user/dto/request';
import { CreateUserDto } from '@user/dto';
import { User } from '@user/dto/response';

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
