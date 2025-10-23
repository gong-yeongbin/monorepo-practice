import { Inject, Injectable } from '@nestjs/common';
import { IUser, USER_REPOSITORY } from '@module/user/domain';

@Injectable()
export class ValidateUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUser) {}

	async execute(userId: string, password: string) {
		const user = await this.userRepository.find(userId);

		if (user?.password !== password) return null;

		return user;
	}
}
