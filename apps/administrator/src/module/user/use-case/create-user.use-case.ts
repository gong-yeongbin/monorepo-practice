import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '@module/user/dto/request';
import { ResponseUserDto } from '@module/user/dto/response';
import { UserDto } from '@module/user/dto/user.dto';
import { IUser, USER_REPOSITORY } from '@module/user/domain';

@Injectable()
export class CreateUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUser) {}

	async execute(createUserDto: CreateUserDto) {
		const { userId, password, role } = createUserDto;
		const salt = 'TEST SALT';

		const user = await this.userRepository.find(userId);
		if (user) throw new ConflictException();

		const userDto = plainToInstance(UserDto, { userId, password, role, salt });
		const data = await this.userRepository.create(userDto);

		const response = plainToInstance(ResponseUserDto, data, { excludeExtraneousValues: true });

		return {
			data: response,
		};
	}
}
