import { Transform } from 'class-transformer';
import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateTrackerInput {
	@Field(() => Int)
	id: number;

	@Field()
	@Transform(({ value }) => value.trim())
	name: string;

	@Field()
	@Transform(({ value }) => value.trim())
	trackingUrl: string;

	@Field()
	@Transform(({ value }) => value.trim())
	installPostbackUrl: string;

	@Field()
	@Transform(({ value }) => value.trim())
	eventPostbackUrl: string;
}
