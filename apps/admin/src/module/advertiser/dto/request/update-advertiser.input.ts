import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateAdvertiserInput {
	@Field(() => Int)
	id: string;

	@Field()
	name: string;
}
