import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PatchAdvertiserDto {
	@IsString()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	name: string;
}
