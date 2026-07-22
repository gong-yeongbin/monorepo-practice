import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UserIdDto {
	@ApiProperty({ description: '사용자 id', example: 1 })
	@Type(() => Number)
	@IsInt()
	id: number;
}
