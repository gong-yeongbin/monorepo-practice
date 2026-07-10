import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAdvertiserDto {
	@IsNotEmpty()
	@IsString()
	name: string;
}
