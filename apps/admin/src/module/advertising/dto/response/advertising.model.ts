import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class Advertising {
	@Expose()
	@Field(() => Int)
	id: number;

	@Expose()
	@Field()
	name: string;

	@Expose()
	@Field(() => String, { nullable: true })
	image?: string;

	@Expose({ name: 'advertiser_id' })
	@Field(() => Int, { nullable: true })
	advertiserId: number;

	@Expose({ name: 'tracker_id' })
	@Field(() => Int, { nullable: true })
	trackerId: number;
}
