// POST /auth/signup 요청 body — email·password로 가입을 신청한다(인증 코드 발송)
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
	@ApiProperty({ description: '가입 이메일', example: 'user@example.com' })
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({ description: '비밀번호(8~72자)', example: 'password1234' })
	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	@MaxLength(72)
	password: string;
}
