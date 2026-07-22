// detail/:id 경로 파라미터(advertising id)를 숫자로 변환하는 DTO
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AdvertisingIdDto {
	@ApiProperty({ description: '광고 id', example: 1 })
	@Type(() => Number)
	@IsInt()
	id: number;
}
