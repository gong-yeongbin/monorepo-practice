import { IsDate } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetStatisticByCampaignDto {
	@IsDate()
	@Transform(({ value }) => new Date(value))
	startDate: Date;

	@IsDate()
	@Transform(({ value }) => new Date(value))
	endDate: Date;
}
