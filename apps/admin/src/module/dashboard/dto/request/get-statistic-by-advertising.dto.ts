import { IsDate } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetStatisticByAdvertisingDto {
	@IsDate()
	@Transform(({ value }) => new Date(value))
	baseDate: Date;
}
