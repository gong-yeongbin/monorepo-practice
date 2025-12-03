import { IsString } from 'class-validator';

export class AdvertisingNameDto {
	@IsString()
	name: string;
}
