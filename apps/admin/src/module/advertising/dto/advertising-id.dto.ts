import { IsNumberString } from 'class-validator';

export class AdvertisingIdDto {
	@IsNumberString()
	id: string;
}
