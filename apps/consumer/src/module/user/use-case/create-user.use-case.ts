import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from '../domain/user-repository';
import { UserDto } from '../shared/dto';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../dto/request';
import { ResponseUserDto } from '../dto/response';

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
