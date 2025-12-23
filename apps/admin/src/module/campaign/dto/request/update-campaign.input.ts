import { Transform } from 'class-transformer';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from '@campaign/enum';

@InputType()
export class UpdateCampaignInput {
	@Field(() => Int)
	id: number;

	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	name: string;

	@Field(() => Type)
	type: Type;

	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	trackerTrackingUrl: string;
}
