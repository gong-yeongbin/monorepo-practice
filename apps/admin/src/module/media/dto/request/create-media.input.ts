import { Transform } from 'class-transformer';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateMediaInput {
	@Field()
	@Transform(({ value }) => value.replaceAll(' ', '').toLowerCase())
	name: string;

	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	installPostbackUrl: string;

	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	eventPostbackUrl: string;
}
