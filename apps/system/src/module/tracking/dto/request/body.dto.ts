import { IsString } from 'class-validator';

export class BodyDto {
	@IsString()
	viewCode: string;
}
