import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Advertiser {
	@Field(() => Int)
	id: number;

	@Field()
	name: string;
}
