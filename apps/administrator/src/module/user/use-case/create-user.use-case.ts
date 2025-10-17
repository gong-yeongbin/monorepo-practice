import { ConflictException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserRepository } from '@module/user/domain';
import { CreateUserDto } from '@module/user/dto/request';
import { UserDto } from '@module/user/shared/dto';
import { ResponseUserDto } from '@module/user/dto/response';

@Injectable()
export class CreateUserUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(createUserDto: CreateUserDto) {
		const { userId, password, role } = createUserDto;
		const salt = 'TEST SALT';

		const user = await this.userRepository.find(userId);
		if (user) throw new ConflictException();

		const userDto = plainToInstance(UserDto, { user_id: userId, password: password, role: role, salt: salt });
		const data = await this.userRepository.create(userDto);

		const response = plainToInstance(ResponseUserDto, { id: data.id, userId: data.user_id, role: data.role });

		return {
			data: response,
		};
	}
}
