// user_id로 프로필을 조회하고 password를 제외해 반환하는 use-case
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@user/domain/user.entity';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';

export type Profile = Omit<User, 'password'>;

@Injectable()
export class GetProfileUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

	async execute(user_id: string): Promise<Profile> {
		const user = await this.userRepository.findByUserId(user_id);
		if (!user) {
			throw new UnauthorizedException();
		}

		return { id: user.id, user_id: user.user_id, role: user.role };
	}
}
