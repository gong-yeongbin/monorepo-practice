// user 응답 스키마(Swagger 문서용). 도메인 User와 필드를 동일하게 유지한다
import { ApiProperty } from '@nestjs/swagger';
import { User, USER_ROLES, UserRole } from '@user/domain/user.entity';

export class UserResponse implements User {
	id: number;

	email: string;

	@ApiProperty({ enum: [...USER_ROLES] })
	role: UserRole;

	approved: boolean;

	created_at: Date;

	updated_at: Date;

	advertiser_id: number | null;
}
