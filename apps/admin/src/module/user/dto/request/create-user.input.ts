import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { Role } from '@user/enum';

@InputType()
export class CreateUserInput {
	@Field()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	userId: string;

	@Field()
	password: string;

	@Field(() => Role)
	role: Role;
}
