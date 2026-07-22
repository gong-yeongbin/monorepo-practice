// POST /auth/signup/verify 요청 body — 이메일과 메일로 받은 6자리 인증 코드
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class VerifyDto {
	@ApiProperty({ description: '가입 신청한 이메일', example: 'user@example.com' })
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({ description: '메일로 받은 6자리 인증 코드', example: '123456' })
	@IsNotEmpty()
	@Matches(/^\d{6}$/)
	code: string;
}
