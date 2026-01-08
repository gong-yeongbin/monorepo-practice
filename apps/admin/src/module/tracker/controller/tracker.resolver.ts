import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Tracker } from '@tracker/dto/response';
import { CreateTrackerUseCase, GetTrackerListUseCase, UpdateTrackerUseCase } from '@tracker/use-case';
import { CreateTrackerInput, UpdateTrackerInput } from '@tracker/dto/request';
import { GraphqlAuthGuard } from '@src/common/guard';
import { UseGuards } from '@nestjs/common';
@UseGuards(GraphqlAuthGuard)
@Resolver(() => Tracker)
export class TrackerResolver {
	constructor(
		private readonly createTrackerUseCase: CreateTrackerUseCase,
		private readonly updateTrackerUseCase: UpdateTrackerUseCase,
		private readonly getTrackerListUseCase: GetTrackerListUseCase
	) {}

	@Query(() => [Tracker], { name: 'tracker' })
	async findAll() {
		return await this.getTrackerListUseCase.execute();
	}

	@Mutation(() => Tracker)
	async createTracker(@Args('input') input: CreateTrackerInput) {
		return await this.createTrackerUseCase.execute(input);
	}

	@Mutation(() => Tracker)
	async updateTracker(@Args('input') input: UpdateTrackerInput) {
		return await this.updateTrackerUseCase.execute(input);
	}
}
