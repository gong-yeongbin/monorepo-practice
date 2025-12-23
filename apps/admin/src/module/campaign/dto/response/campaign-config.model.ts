import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class CampaignConfig {
	@Expose({ name: 'campaign_id' })
	@Field(() => Int)
	campaignId: number;

	@Expose({ name: 'send_media' })
	@Field(() => Boolean)
	sendMedia: boolean;

	@Expose({ name: 'tracker_event_name' })
	@Field()
	trackerEventName: string;

	@Expose({ name: 'admin_event_name' })
	@Field()
	adminEventName: string;

	@Expose({ name: 'media_event_name' })
	@Field()
	mediaEventName: string;
}
