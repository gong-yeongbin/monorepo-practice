// user 전체 목록을 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { User } from '@user/domain/user.entity';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';

@Injectable()
export class ListUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

	async execute(): Promise<User[]> {
		return this.userRepository.findAll();
	}
}
