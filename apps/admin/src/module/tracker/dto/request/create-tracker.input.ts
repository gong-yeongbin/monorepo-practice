import { Transform } from 'class-transformer';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateTrackerInput {
	@Field()
	@Transform(({ value }) => value.replaceAll(' ', '').toLowerCase())
	name: string;

	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	trackingUrl: string;

	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	installPostbackUrl: string;

	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	eventPostbackUrl: string;
}
