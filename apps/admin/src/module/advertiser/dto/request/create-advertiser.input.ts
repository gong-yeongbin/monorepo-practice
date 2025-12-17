import { Transform } from 'class-transformer';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateAdvertiserInput {
	@Field()
	name: string;
	// @Transform(({ value }) => value.replaceAll(' ', ''))
}
