import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class MediaIdDto {
	@ApiProperty({ description: '매체 id', example: 1 })
	@Type(() => Number)
	@IsInt()
	id: number;
}
