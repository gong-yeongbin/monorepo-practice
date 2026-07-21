// POST /auth/signin 요청 body — email·password로 로그인한다(길이 검증은 불필요, 틀리면 어차피 불일치)
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SigninDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	password: string;
}
