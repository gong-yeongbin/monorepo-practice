// email·password 검증(불일치 401, 미승인 403) 후 access·refresh token을 발급하고 refresh를 캐시에 저장.
// 세 출구(성공·401·403) 모두 login_history에 기록한다 — 실패 기록은 예외를 던지기 전에 쓴다.
import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';
import { CACHE_PORT, CachePort } from '@infra/cache/cache.port';
import { LoginResult } from '@auth/domain/login-history.entity';
import { LOGIN_HISTORY_REPOSITORY, LoginHistoryRepository } from '@auth/domain/login-history.repository';
import {
	ACCESS_TOKEN_EXPIRES_IN,
	AccessTokenPayload,
	REFRESH_TOKEN_EXPIRES_IN,
	REFRESH_TOKEN_TTL,
	RefreshTokenPayload,
	refreshTokenKey,
} from '@auth/application/token.constants';

export interface SigninResult {
	access_token: string;
	refresh_token: string;
}

// 컨트롤러가 요청에서 꺼내 넘기는 클라이언트 정보. ip는 TRUST_PROXY가 켜지면 X-Forwarded-For 기준이다(main.ts)
export interface SigninClient {
	ip: string;
	user_agent: string | null;
}

@Injectable()
export class SigninUseCase {
	constructor(
		@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
		@Inject(CACHE_PORT) private readonly cache: CachePort,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		@Inject(LOGIN_HISTORY_REPOSITORY) private readonly loginHistoryRepository: LoginHistoryRepository
	) {}

	async execute(email: string, password: string, client: SigninClient): Promise<SigninResult> {
		// email 없음·비밀번호 불일치는 같은 401로 응답한다(계정 존재 여부 비노출)
		const user = await this.userRepository.findByEmailWithPassword(email);
		if (!user) {
			// 계정이 없어도 시도는 남긴다(user_id null). 응답은 비밀번호 불일치와 같은 401이지만 기록은 감사용이라 email을 그대로 둔다
			await this.record(null, email, 'INVALID_CREDENTIALS', client);
			throw new UnauthorizedException('invalid credentials');
		}
		if (!(await bcrypt.compare(password, user.password))) {
			await this.record(user.id, email, 'INVALID_CREDENTIALS', client);
			throw new UnauthorizedException('invalid credentials');
		}
		// approved 체크는 비밀번호 검증 뒤에 한다(비밀번호를 모르는 사람에게 승인 상태 비노출)
		if (!user.approved) {
			await this.record(user.id, email, 'NOT_APPROVED', client);
			throw new ForbiddenException('not approved');
		}

		// 허용 광고 목록은 findByEmailWithPassword가 이미 실어 오므로 추가 조회가 없다
		const accessPayload: AccessTokenPayload = { sub: user.id, email: user.email, role: user.role, advertising_ids: user.advertising_ids };
		const refreshPayload: RefreshTokenPayload = { sub: user.id };
		const accessToken = await this.jwtService.signAsync(accessPayload, { secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'), expiresIn: ACCESS_TOKEN_EXPIRES_IN });
		const refreshToken = await this.jwtService.signAsync(refreshPayload, {
			secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
			expiresIn: REFRESH_TOKEN_EXPIRES_IN,
		});

		// 사용자당 활성 refresh는 1개 — 재로그인하면 이전 refresh는 대조 실패로 무효화된다
		await this.cache.set(refreshTokenKey(user.id), refreshToken, REFRESH_TOKEN_TTL);

		await this.record(user.id, email, 'SUCCESS', client);

		return { access_token: accessToken, refresh_token: refreshToken };
	}

	// 기록 실패는 로그인 실패(500)로 드러낸다 — 감사 목적이라 조용히 누락되는 것보다 낫다
	private record(user_id: number | null, email: string, result: LoginResult, client: SigninClient): Promise<void> {
		return this.loginHistoryRepository.create({ user_id, email, result, ip: client.ip, user_agent: client.user_agent });
	}
}
