// 이미 가입 완료된 email이면 409를 던지는 공용 중복 검사 함수(signup·verify에서 사용)
import { ConflictException } from '@nestjs/common';
import { UserRepository } from '@user/domain/user.repository';

export async function ensureEmailNotRegistered(userRepository: UserRepository, email: string): Promise<void> {
	if (await userRepository.findByEmail(email)) {
		throw new ConflictException('already exists email');
	}
}
