import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class Campaign {
	@Expose()
	@Field(() => Int)
	id: number;

	@Expose()
	@Field()
	token: string;

	@Expose()
	@Field()
	name: string;

	@Expose()
	@Field()
	type: string;

	@Expose({ name: 'is_active' })
	@Field()
	isActive: boolean;

	@Expose({ name: 'tracker_name' })
	@Field()
	trackerName: string;

	@Expose({ name: 'tracker_tracking_url' })
	@Field()
	trackerTrackingUrl: string;

	@Expose({ name: 'advertising_id' })
	@Field()
	advertisingId: number;

	@Expose({ name: 'media_id' })
	@Field()
	mediaId: number;
}
