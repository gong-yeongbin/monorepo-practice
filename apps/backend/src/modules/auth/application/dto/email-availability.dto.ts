// GET /auth/email-availability 요청 query — 가입 가능 여부를 확인할 email
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailAvailabilityDto {
	@ApiProperty({ description: '확인할 이메일', example: 'user@example.com' })
	@IsNotEmpty()
	@IsEmail()
	email: string;
}
