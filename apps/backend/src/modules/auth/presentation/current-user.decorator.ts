// 라우트 핸들러에서 JwtAuthGuard가 request.user에 실어 둔 access token payload를 꺼내는 파라미터 데코레이터
import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenPayload } from '@auth/application/token.constants';

// createParamDecorator로 감싸면 팩토리를 직접 호출할 수 없어 테스트용으로 따로 export한다
export const currentUserFactory = (_data: unknown, context: ExecutionContext): AccessTokenPayload => context.switchToHttp().getRequest<Request & { user: AccessTokenPayload }>().user;

// @Public 라우트에서는 request.user가 비어 있으므로 @Roles가 붙은 라우트에서만 쓴다
export const CurrentUser = createParamDecorator(currentUserFactory);
