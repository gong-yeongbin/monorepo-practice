import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdvertisingDto {
	@ApiProperty({ description: '광고 이름', example: '테스트 광고' })
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({ description: '소속 광고주 id', example: 1 })
	@Type(() => Number)
	@IsInt()
	advertiser_id: number;

	@ApiProperty({ description: '연동 트래커 id', example: 1 })
	@Type(() => Number)
	@IsInt()
	tracker_id: number;

	// 파일 업로드 대신 이미지 URL을 직접 받는다(S3 인프라 없음)
	@ApiPropertyOptional({ description: '광고 이미지 URL', example: 'https://example.com/image.png' })
	@IsOptional()
	@IsString()
	image?: string;
}
