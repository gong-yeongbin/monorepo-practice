import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ReservationIdDto {
	@ApiProperty({ description: '예약 id', example: 1 })
	@Type(() => Number)
	@IsInt()
	id: number;
}
