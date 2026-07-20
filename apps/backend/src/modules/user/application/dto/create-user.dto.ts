// POST /user 요청 body — email만 받고 role·approved는 DB 기본값을 쓴다
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;
}
