import { Transform } from 'class-transformer';
import { Field, InputType } from '@nestjs/graphql';
import { Type } from '@campaign/enum';

@InputType()
export class CreateCampaignInput {
	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	name: string;

	@Field(() => Type)
	type: Type;

	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	trackerTrackingUrl: string;

	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	advertisingName: string;

	@Field()
	@Transform(({ value }) => value.replaceAll(' ', '').toLowerCase())
	mediaName: string;
}
