// POST /auth/signin 요청 body — email·password로 로그인한다(길이 검증은 불필요, 틀리면 어차피 불일치)
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SigninDto {
	@ApiProperty({ description: '가입한 이메일', example: 'user@example.com' })
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({ description: '비밀번호', example: 'password1234' })
	@IsNotEmpty()
	@IsString()
	password: string;
}
