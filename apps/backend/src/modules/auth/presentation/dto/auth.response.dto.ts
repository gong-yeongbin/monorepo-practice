// auth 응답 스키마(Swagger 문서용)
import { ApiProperty } from '@nestjs/swagger';

export class SigninResponse {
	@ApiProperty({ description: 'access token(JWT)' })
	access_token: string;

	@ApiProperty({ description: 'refresh token(JWT)' })
	refresh_token: string;
}

export class RefreshResponse {
	@ApiProperty({ description: '재발급된 access token(JWT)' })
	access_token: string;
}

export class EmailAvailabilityResponse {
	@ApiProperty({ description: '가입 가능한 email이면 true, 이미 가입된 email이면 false' })
	available: boolean;
}
