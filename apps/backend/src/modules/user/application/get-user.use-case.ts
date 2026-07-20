// user 단건을 조회하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@user/domain/user.entity';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';

@Injectable()
export class GetUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

	async execute(id: number): Promise<User> {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new NotFoundException();
		}

		return user;
	}
}
