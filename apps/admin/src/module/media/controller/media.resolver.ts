import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Media } from '@media/dto/response';
import { CreateMediaInput, UpdateMediaInput } from '@media/dto/request';
import { CreateMediaUseCase, GetMediaListUseCase, UpdateMediaUseCase } from '@media/use-case';

@Resolver(() => Media)
export class MediaResolver {
	constructor(
		private readonly createMediaUseCase: CreateMediaUseCase,
		private readonly updateMediaUseCase: UpdateMediaUseCase,
		private readonly getMediaListUseCase: GetMediaListUseCase
	) {}

	@Query(() => [Media], { name: 'medias' })
	async findAll() {
		return await this.getMediaListUseCase.execute();
	}

	@Mutation(() => Media)
	async createMedia(@Args('input') input: CreateMediaInput) {
		return await this.createMediaUseCase.execute(input);
	}

	@Mutation(() => Media)
	async updateMedia(@Args('input') input: UpdateMediaInput) {
		return await this.updateMediaUseCase.execute(input);
	}
}
