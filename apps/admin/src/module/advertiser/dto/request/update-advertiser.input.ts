import { Field, InputType, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';

@InputType()
export class UpdateAdvertiserInput {
	@Field(() => Int)
	id: string;

	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	name: string;
}
