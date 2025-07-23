import { IsString } from 'class-validator';

export class TrackerIdDto {
	@IsString()
	id: string;
}
