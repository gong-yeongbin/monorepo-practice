import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '@user/dto';

@Injectable()
export class CreateTokenUseCase {
	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) {}

	async execute(user: CreateUserDto) {
		const secret = this.configService.get<string>('JWT_SECRET');
		const expiresIn = this.configService.get<number>('JWT_EXPIRES');

		const payload = { userId: user.user_id };

		return await this.jwtService.signAsync(payload, { secret, expiresIn });
	}
}
