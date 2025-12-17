import { Query, Resolver } from '@nestjs/graphql';
import { AppService } from '@src/app.service';

@Resolver()
export class AppResolver {
	constructor(private readonly appService: AppService) {}

	@Query(() => String, { name: 'hello' })
	hello(): string {
		return this.appService.getHello();
	}
}
