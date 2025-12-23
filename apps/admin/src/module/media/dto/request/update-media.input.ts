import { Transform } from 'class-transformer';
import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateMediaInput {
	@Field(() => Int)
	id: number;

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
