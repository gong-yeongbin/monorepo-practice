import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalAuthGuard } from '@common/guard';
import { CreateTokenUseCase } from '@auth/use-case';
import { User } from '@auth/decorator';
import { CreateUserDto } from '@user/dto';

@Resolver()
export class AuthResolver {
	private readonly cookieConfig: Record<string, any>;

	constructor(
		private readonly configService: ConfigService,
		private readonly createTokenUseCase: CreateTokenUseCase
	) {
		this.cookieConfig = { secure: configService.get<string>('ENV') != 'DEV', httpOnly: true, maxAge: configService.get<number>('JWT_EXPIRES') ?? 0 };
	}

	@Mutation(() => Boolean)
	@UseGuards(LocalAuthGuard)
	async login(@Args('userId') userId: string, @Args('password') password: string, @User() user: CreateUserDto, @Context() ctx) {
		const access_token = await this.createTokenUseCase.execute(user);
		ctx.res.cookie('access_token', access_token, this.cookieConfig);

		return true;
	}
}
