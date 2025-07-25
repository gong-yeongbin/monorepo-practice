import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAdvertiserDto {
	@IsString()
	@Transform(({ value }) => value.trim())
	name: string;
}
