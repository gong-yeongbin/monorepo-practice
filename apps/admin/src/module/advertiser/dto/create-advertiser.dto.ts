import { Expose } from 'class-transformer';

export class CreateAdvertiserDto {
	@Expose()
	id: number;

	@Expose()
	name: string;
}
