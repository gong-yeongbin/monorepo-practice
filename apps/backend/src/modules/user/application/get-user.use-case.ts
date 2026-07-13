// user 단건을 password 제외한 프로필로 조회하는 use-case
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Profile, toProfile } from '@user/domain/user.entity';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';

@Injectable()
export class GetUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

	async execute(id: number): Promise<Profile> {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new NotFoundException();
		}

		return toProfile(user);
	}
}
