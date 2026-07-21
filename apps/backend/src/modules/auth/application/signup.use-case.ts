// 가입 1단계 — 비밀번호를 해시해 가입 대기 정보로 저장하고 6자리 인증 코드를 메일로 발송하는 use-case(이미 가입된 email이면 409, 재요청 시 덮어씀)
import { randomInt } from 'node:crypto';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';
import { CACHE_PORT, CachePort } from '@infra/cache/cache.port';
import { MAIL_PORT, MailPort } from '@infra/mail/mail.port';
import { PENDING_SIGNUP_TTL, PendingSignup, pendingSignupKey } from '@auth/application/pending-signup.constants';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class SignupUseCase {
	constructor(
		@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
		@Inject(CACHE_PORT) private readonly cache: CachePort,
		@Inject(MAIL_PORT) private readonly mail: MailPort
	) {}

	async execute(email: string, password: string): Promise<void> {
		const existing = await this.userRepository.findByEmail(email);
		if (existing) {
			throw new ConflictException('already exists email');
		}

		const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
		const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
		const pending: PendingSignup = { password: hashed, code };

		await this.cache.set(pendingSignupKey(email), JSON.stringify(pending), PENDING_SIGNUP_TTL);
		await this.mail.send(email, '이메일 인증 코드', `인증 코드: ${code} (10분 안에 입력해주세요)`);
	}
}
