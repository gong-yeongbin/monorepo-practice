import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMediaDto {
	@IsString()
	@Transform(({ value }) => value.replaceAll(' ', '').toLowerCase())
	name: string;

	@IsString()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	installPostbackUrl: string;

	@IsString()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	eventPostbackUrl: string;
}
