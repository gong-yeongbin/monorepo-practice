import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class User {
	@Field()
	@Expose()
	id: string;

	@Field()
	@Expose({ name: 'user_id' })
	userId: string;

	@Field()
	password: string;

	@Field()
	@Expose()
	role: string;
}
