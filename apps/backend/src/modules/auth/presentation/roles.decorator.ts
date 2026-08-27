// 해당 컨트롤러·라우트에 접근 가능한 역할을 선언하는 데코레이터
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@user/domain/user.entity';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
