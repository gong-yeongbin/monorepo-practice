import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateAdvertisingInput {
	@Field(() => Int)
	id: number;

	@Field()
	name: string;

	@Field(() => String, { nullable: true })
	image?: string;
}
