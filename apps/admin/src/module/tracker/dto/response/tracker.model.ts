import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class Tracker {
	@Expose()
	@Field(() => Int)
	id: number;

	@Expose()
	@Field()
	name: string;

	@Expose({ name: 'tracking_url' })
	@Field()
	trackingUrl: string;

	@Expose({ name: 'install_postback_url' })
	@Field()
	installPostbackUrl: string;

	@Expose({ name: 'event_postback_url' })
	@Field()
	eventPostbackUrl: string;
}
