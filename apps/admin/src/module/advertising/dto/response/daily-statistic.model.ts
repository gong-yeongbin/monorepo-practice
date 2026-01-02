import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class DailyStatistic {
	@Expose()
	@Field(() => Int)
	click: number;

	@Expose()
	@Field(() => Int)
	install: number;

	@Expose()
	@Field(() => Int)
	registration: number;

	@Expose()
	@Field(() => Int)
	retention: number;

	@Expose()
	@Field(() => Int)
	purchase: number;

	@Expose()
	@Field(() => Int)
	revenue: number;

	@Expose()
	@Field(() => Int)
	etc1: number;

	@Expose()
	@Field(() => Int)
	etc2: number;

	@Expose()
	@Field(() => Int)
	etc3: number;

	@Expose()
	@Field(() => Int)
	etc4: number;

	@Expose()
	@Field(() => Int)
	etc5: number;

	@Expose()
	@Field(() => Int)
	unregistered: number;
}
