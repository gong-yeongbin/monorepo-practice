import { IsString } from 'class-validator';

export class AdvertiserIdDto {
	@IsString()
	id: string;
}
