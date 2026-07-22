import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListAdvertisingDto {
	@ApiPropertyOptional({ description: '이름 검색어', default: '' })
	@IsOptional()
	@IsString()
	search: string = '';

	@ApiPropertyOptional({ description: '페이징 offset', default: 0 })
	@Type(() => Number)
	@IsInt()
	offset: number = 0;

	@ApiPropertyOptional({ description: '페이지 크기', default: 20 })
	@Type(() => Number)
	@IsInt()
	limit: number = 20;
}
