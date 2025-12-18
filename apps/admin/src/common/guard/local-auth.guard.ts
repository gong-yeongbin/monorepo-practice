import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
	getRequest(context: ExecutionContext) {
		const gqlCtx = GqlExecutionContext.create(context);
		const args = gqlCtx.getArgs();
		const ctx = gqlCtx.getContext();
		const request = ctx.req;

		request.body = {
			userId: args.userId,
			password: args.password,
		};
		return request;
	}
}
