import { IsNumber } from 'class-validator';

export class AdvertisingIdDto {
	@IsNumber()
	id: number;
}
