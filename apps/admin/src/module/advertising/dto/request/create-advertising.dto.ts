import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAdvertisingDto {
	@IsString()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	name: string;

	@IsOptional()
	@IsString()
	@Transform(({ value }) => (value ? value.replaceAll(' ', '') : null))
	image: string;

	@IsString()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	advertiserName: string;

	@IsString()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	trackerName: string;
}
