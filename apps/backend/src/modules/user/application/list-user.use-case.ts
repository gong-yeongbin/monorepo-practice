// user 전체를 password 제외한 프로필 목록으로 조회하는 use-case
import { Inject, Injectable } from '@nestjs/common';
import { Profile, toProfile } from '@user/domain/user.entity';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';

@Injectable()
export class ListUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

	async execute(): Promise<Profile[]> {
		const users = await this.userRepository.findAll();
		return users.map(toProfile);
	}
}
