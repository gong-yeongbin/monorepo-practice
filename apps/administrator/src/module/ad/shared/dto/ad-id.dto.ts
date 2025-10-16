import { IsString } from 'class-validator';

export class AdIdDto {
	@IsString()
	id: string;
}
