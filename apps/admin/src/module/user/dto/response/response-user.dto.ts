import { Expose } from 'class-transformer';

export class ResponseUserDto {
	@Expose()
	id: number;

	@Expose({ name: 'user_id' })
	userId: string;

	@Expose()
	role: string;
}
