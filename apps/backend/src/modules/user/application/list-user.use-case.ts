// user 목록을 조회하는 use-case (승인 여부 필터 지원 — 승인 대기 목록은 approved: false)
import { Inject, Injectable } from '@nestjs/common';
import { User } from '@user/domain/user.entity';
import { FindAllUserFilter, USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';

@Injectable()
export class ListUserUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

	async execute(filter?: FindAllUserFilter): Promise<User[]> {
		return this.userRepository.findAll(filter);
	}
}
