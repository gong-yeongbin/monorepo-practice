import { CreateMediaUseCase, GetMediaListUseCase, UpdateMediaUseCase } from '../use-case';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Media } from '@module/media/dto/response';
import { CreateMediaInput, UpdateMediaInput } from '@module/media/dto/request';

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
