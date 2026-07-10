// 보호된 어드민 API에서 JWT를 검증하는 가드(admin의 TokenInterceptor 대체)
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
