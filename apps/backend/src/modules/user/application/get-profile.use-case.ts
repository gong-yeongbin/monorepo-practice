// user_id로 프로필을 조회하고 password를 제외해 반환하는 use-case
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Profile, toProfile } from '@user/domain/user.entity';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';

// 기존 import 경로(@user/application/get-profile.use-case) 호환을 위해 domain의 Profile을 재노출한다.
export { Profile };

@Injectable()
export class GetProfileUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

	async execute(user_id: string): Promise<Profile> {
		const user = await this.userRepository.findByUserId(user_id);
		if (!user) {
			throw new UnauthorizedException();
		}

		return toProfile(user);
	}
}
