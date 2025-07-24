import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAdvertiserDto {
	@IsString()
	@Transform(({ value }) => value.trim())
	name: string;
}
