// email·password 검증(불일치 401, 미승인 403) 후 access·refresh token을 발급하고 refresh를 캐시에 저장
import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';
import { CACHE_PORT, CachePort } from '@infra/cache/cache.port';
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

@Injectable()
export class SigninUseCase {
	constructor(
		@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
		@Inject(CACHE_PORT) private readonly cache: CachePort,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	async execute(email: string, password: string): Promise<SigninResult> {
		// email 없음·비밀번호 불일치는 같은 401로 응답한다(계정 존재 여부 비노출)
		const user = await this.userRepository.findByEmailWithPassword(email);
		if (!user) {
			throw new UnauthorizedException('invalid credentials');
		}
		if (!(await bcrypt.compare(password, user.password))) {
			throw new UnauthorizedException('invalid credentials');
		}
		// approved 체크는 비밀번호 검증 뒤에 한다(비밀번호를 모르는 사람에게 승인 상태 비노출)
		if (!user.approved) {
			throw new ForbiddenException('not approved');
		}

		const accessPayload: AccessTokenPayload = { sub: user.id, email: user.email, role: user.role };
		const refreshPayload: RefreshTokenPayload = { sub: user.id };
		const accessToken = await this.jwtService.signAsync(accessPayload, { secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'), expiresIn: ACCESS_TOKEN_EXPIRES_IN });
		const refreshToken = await this.jwtService.signAsync(refreshPayload, {
			secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
			expiresIn: REFRESH_TOKEN_EXPIRES_IN,
		});

		// 사용자당 활성 refresh는 1개 — 재로그인하면 이전 refresh는 대조 실패로 무효화된다
		await this.cache.set(refreshTokenKey(user.id), refreshToken, REFRESH_TOKEN_TTL);

		return { access_token: accessToken, refresh_token: refreshToken };
	}
}
