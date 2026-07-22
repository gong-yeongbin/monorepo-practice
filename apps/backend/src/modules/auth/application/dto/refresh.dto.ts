// POST /auth/refresh 요청 body — refresh token으로 access token을 재발급받는다
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
	@ApiProperty({ description: '로그인 시 발급받은 refresh token', example: 'eyJhbGciOiJIUzI1NiIs...' })
	@IsNotEmpty()
	@IsString()
	refresh_token: string;
}
