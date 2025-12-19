import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class Advertising {
	@Field(() => Int)
	@Expose()
	id: number;

	@Field()
	@Expose()
	name: string;

	@Field(() => String, { nullable: true })
	@Expose()
	image?: string;

	@Field()
	@Expose({ name: 'advertiser_name' })
	advertiserName: string;

	@Field()
	@Expose({ name: 'tracker_name' })
	trackerName: string;
}
