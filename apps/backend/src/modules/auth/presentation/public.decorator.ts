// 전역 JwtAuthGuard·RolesGuard를 건너뛰는 공개(무인증) 라우트 표시 데코레이터
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
