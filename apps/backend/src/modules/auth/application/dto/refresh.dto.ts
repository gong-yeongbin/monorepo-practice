// POST /auth/refresh 요청 body — refresh token으로 access token을 재발급받는다
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
	@IsNotEmpty()
	@IsString()
	refresh_token: string;
}
