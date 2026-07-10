// user_id로 user를 조회하는 use-case(auth 자격 검증에서 사용)
import { Inject, Injectable } from '@nestjs/common';
import { User } from '@user/domain/user.entity';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';

@Injectable()
export class FindUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

	async execute(user_id: string): Promise<User | null> {
		return this.userRepository.findByUserId(user_id);
	}
}
