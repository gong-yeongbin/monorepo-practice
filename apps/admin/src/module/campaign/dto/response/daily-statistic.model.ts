import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class DailyStatistic {
	@Expose({ name: 'view_code' })
	@Field()
	viewCode: string;

	@Expose()
	@Field()
	token: string;

	@Expose({ name: 'pub_id' })
	@Field({ nullable: true })
	pubId: string;

	@Expose({ name: 'sub_id' })
	@Field({ nullable: true })
	subId: string;

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

	@Expose({ name: 'created_date' })
	@Field(() => Date)
	createdDate: Date;
}
