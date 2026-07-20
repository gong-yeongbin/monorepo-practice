// POST /user/verify 요청 body — 이메일과 메일로 받은 6자리 인증 코드
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class VerifySignupDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@Matches(/^\d{6}$/)
	code: string;
}
