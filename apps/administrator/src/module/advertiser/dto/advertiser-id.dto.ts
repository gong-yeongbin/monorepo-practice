import { IsNumberString } from 'class-validator';

export class AdvertiserIdDto {
	@IsNumberString()
	id: string;
}
