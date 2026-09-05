// PATCH /users/:id/password 요청 body — DEVELOPER가 해당 user의 비밀번호를 새 값으로 초기화한다
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserPasswordDto {
	@ApiProperty({ description: '새 비밀번호(8~72자)', example: 'password1234' })
	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	@MaxLength(72)
	password: string;
}
