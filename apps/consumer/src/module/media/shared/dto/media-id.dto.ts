import { IsString } from 'class-validator';

export class MediaIdDto {
	@IsString()
	id: string;
}
