import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdvertisingDto {
	@IsNotEmpty()
	@IsString()
	name: string;

	@Type(() => Number)
	@IsInt()
	advertiser_id: number;

	@Type(() => Number)
	@IsInt()
	tracker_id: number;

	// 파일 업로드 대신 이미지 URL을 직접 받는다(S3 인프라 없음)
	@IsOptional()
	@IsString()
	image?: string;
}
