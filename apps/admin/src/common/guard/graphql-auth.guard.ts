import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GraphqlAuthGuard extends AuthGuard('secure-cookie') {
	getRequest(context: ExecutionContext) {
		const gql = GqlExecutionContext.create(context);
		const { req } = gql.getContext();
		return req;
	}
}
