import { Injectable } from '@nestjs/common';
import { UserRepository } from '@module/user/domain';

@Injectable()
export class ValidateUserUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(userId: string, password: string) {
		const user = await this.userRepository.find(userId);

		if (user?.password !== password) return null;

		return user;
	}
}
