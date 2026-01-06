import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class Advertiser {
	@Expose()
	@Field(() => Int)
	id: number;

	@Expose()
	@Field()
	name: string;
}
