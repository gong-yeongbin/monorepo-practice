import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const User = createParamDecorator((_, ctx: ExecutionContext) => {
	const gqlCtx = GqlExecutionContext.create(ctx);
	return gqlCtx.getContext().req.user;
});
