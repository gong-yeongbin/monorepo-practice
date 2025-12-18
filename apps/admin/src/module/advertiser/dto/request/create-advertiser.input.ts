import { Transform } from 'class-transformer';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateAdvertiserInput {
	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	name: string;
}
