import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Advertising {
	@Field(() => Int)
	id: number;

	@Field()
	name: string;

	@Field(() => String, { nullable: true })
	image?: string;

	@Field(() => Int, { nullable: true })
	advertiser_id: number;

	@Field(() => Int, { nullable: true })
	tracker_id: number;
}
