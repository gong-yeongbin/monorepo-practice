import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto';
import { UserRepository } from '../domain/user-repository';
// import { UserDto } from '../shared/dto';

@Injectable()
export class CreateUserUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(body: CreateUserDto) {
		console.log(body);
	}
}
