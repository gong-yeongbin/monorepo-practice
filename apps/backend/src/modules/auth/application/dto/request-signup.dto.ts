// POST /auth/signup 요청 body — email·password로 가입을 신청한다(인증 코드 발송)
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RequestSignupDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	@MaxLength(72)
	password: string;
}
