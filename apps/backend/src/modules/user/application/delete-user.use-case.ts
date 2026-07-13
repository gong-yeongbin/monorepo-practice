// user를 삭제하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';

@Injectable()
export class DeleteUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

	async execute(id: number): Promise<void> {
		if (!(await this.userRepository.findById(id))) {
			throw new NotFoundException();
		}

		await this.userRepository.delete(id);
	}
}
