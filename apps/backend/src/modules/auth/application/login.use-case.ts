// 검증된 user로 JWT accessToken을 발급하는 use-case
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Profile } from '@user/application/get-profile.use-case';

export interface JwtPayload {
	user_id: string;
	role: Profile['role'];
}

@Injectable()
export class LoginUseCase {
	constructor(private readonly jwtService: JwtService) {}

	async execute(user: Profile): Promise<{ accessToken: string }> {
		const payload: JwtPayload = { user_id: user.user_id, role: user.role };
		return { accessToken: await this.jwtService.signAsync(payload) };
	}
}
