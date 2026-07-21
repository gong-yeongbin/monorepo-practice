// refresh token 검증(서명·캐시 대조 실패 401, 미승인 403) 후 access token을 재발급
import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { USER_REPOSITORY, UserRepository } from '@user/domain/user.repository';
import { CACHE_PORT, CachePort } from '@infra/cache/cache.port';
import { ACCESS_TOKEN_EXPIRES_IN, AccessTokenPayload, RefreshTokenPayload, refreshTokenKey } from '@auth/application/token.constants';

export interface RefreshResult {
	access_token: string;
}

@Injectable()
export class RefreshUseCase {
	constructor(
		@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
		@Inject(CACHE_PORT) private readonly cache: CachePort,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	async execute(refreshToken: string): Promise<RefreshResult> {
		// 서명 무효·캐시 불일치·user 없음은 같은 401로 응답한다(실패 원인 비노출)
		let payload: RefreshTokenPayload;
		try {
			payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, { secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET') });
		} catch {
			throw new UnauthorizedException('invalid refresh token');
		}

		// 저장된 refresh와 대조 — 만료·재로그인으로 교체된 token을 걸러낸다
		const stored = await this.cache.get(refreshTokenKey(payload.sub));
		if (stored !== refreshToken) {
			throw new UnauthorizedException('invalid refresh token');
		}

		const user = await this.userRepository.findById(payload.sub);
		if (!user) {
			throw new UnauthorizedException('invalid refresh token');
		}
		if (!user.approved) {
			throw new ForbiddenException('not approved');
		}

		const accessPayload: AccessTokenPayload = { sub: user.id, email: user.email, role: user.role };
		const accessToken = await this.jwtService.signAsync(accessPayload, { secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'), expiresIn: ACCESS_TOKEN_EXPIRES_IN });

		return { access_token: accessToken };
	}
}
