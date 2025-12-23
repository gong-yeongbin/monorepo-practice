import { Transform } from 'class-transformer';
import { Field, Int } from '@nestjs/graphql';

export class UpsertCampaignConfigInput {
	@Field(() => Int)
	campaignId: number;

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
