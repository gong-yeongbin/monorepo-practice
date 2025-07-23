import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateMediaDto {
	@IsString()
	@Transform(({ value }) => value.trim())
	name: string;

	@IsString()
	@Transform(({ value }) => value.trim())
	installPostbackUrl: string;

	@IsString()
	@Transform(({ value }) => value.trim())
	eventPostbackUrl: string;
}
