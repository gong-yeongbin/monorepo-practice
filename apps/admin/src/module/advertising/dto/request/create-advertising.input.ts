import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateAdvertisingInput {
	@Field()
	name: string;

	@Field(() => String, { nullable: true })
	image?: string;

	@Field()
	advertiserName: string;

	@Field()
	trackerName: string;
}
