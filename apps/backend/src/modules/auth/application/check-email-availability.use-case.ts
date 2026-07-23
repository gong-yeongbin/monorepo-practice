// 가입 전 이메일 사용 가능 여부를 조회하는 use-case(가입 여부와 무관하게 항상 200, available로 응답)
import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';

export interface EmailAvailabilityResult {
	available: boolean;
}

@Injectable()
export class CheckEmailAvailabilityUseCase {
	constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

	async execute(email: string): Promise<EmailAvailabilityResult> {
		const existing = await this.userRepository.findByEmail(email);
		return { available: !existing };
	}
}
