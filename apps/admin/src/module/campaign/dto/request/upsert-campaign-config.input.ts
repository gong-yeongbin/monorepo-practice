import { Transform } from 'class-transformer';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpsertCampaignConfigInput {
	@Field(() => Boolean)
	sendMedia: boolean;

	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	trackerEventName: string;

	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	adminEventName: string;

	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	mediaEventName: string;
}
