import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from '../../user/shared/dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CreateTokenUseCase {
	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) {}

	async execute(user: UserDto) {
		const secret = this.configService.get<string>('JWT_SECRET');
		const expiresIn = this.configService.get<string>('JWT_EXPIRES');

		const payload = { userId: user.user_id, role: user.role };

		return await this.jwtService.signAsync(payload, { secret, expiresIn });
	}
}
