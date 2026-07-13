// detail/:id 경로 파라미터(advertising id)를 숫자로 변환하는 DTO
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AdvertisingIdDto {
	@Type(() => Number)
	@IsInt()
	id: number;
}
