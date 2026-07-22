import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class TrackerIdDto {
	@ApiProperty({ description: '트래커 id', example: 1 })
	@Type(() => Number)
	@IsInt()
	id: number;
}
