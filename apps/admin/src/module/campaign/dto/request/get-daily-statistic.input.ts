import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetDailyStatisticInput {
	@Field()
	startDate: Date;

	@Field()
	endDate: Date;
}
