import { IsDate, IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetAdvertisingDashboardDto {
	@IsDate()
	@Transform(({ value }) => new Date(value))
	baseDate: Date;
}
