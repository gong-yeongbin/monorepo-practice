import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAdDto {
	@IsString()
	@Transform(({ value }) => value.trim())
	name: string;

	@IsOptional()
	@IsString()
	@Transform(({ value }) => value.trim())
	image: string;

	@IsString()
	@Transform(({ value }) => value.trim())
	advertiserName: string;
}
