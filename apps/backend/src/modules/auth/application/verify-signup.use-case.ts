// 가입 2단계 — 인증 코드 검증을 통과하면 가입 대기 정보의 해시로 user를 생성하는 use-case
import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';
import { CACHE_PORT, CachePort } from '@infra/cache/cache.port';
import { PendingSignup, pendingSignupKey } from '@auth/application/pending-signup.constants';

@Injectable()
export class VerifySignupUseCase {
	constructor(
		@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
		@Inject(CACHE_PORT) private readonly cache: CachePort
	) {}

	async execute(email: string, code: string): Promise<void> {
		const existing = await this.userRepository.findByEmail(email);
		if (existing) {
			throw new ConflictException('already exists email');
		}

		// 만료(캐시 miss)와 불일치를 같은 400으로 응답한다(코드 존재 여부를 노출하지 않기 위함)
		const cached = await this.cache.get(pendingSignupKey(email));
		if (!cached) {
			throw new BadRequestException('invalid or expired code');
		}

		const pending = JSON.parse(cached) as PendingSignup;
		if (pending.code !== code) {
			throw new BadRequestException('invalid or expired code');
		}

		await this.userRepository.create({ email, password: pending.password });
		await this.cache.del(pendingSignupKey(email));
	}
}
