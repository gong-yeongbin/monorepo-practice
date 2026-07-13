import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMediaDto {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsNotEmpty()
	@IsString()
	install_postback_url: string;

	@IsNotEmpty()
	@IsString()
	event_postback_url: string;
}
