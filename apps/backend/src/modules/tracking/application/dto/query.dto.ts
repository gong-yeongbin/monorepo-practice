import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class QueryDto {
	@ApiProperty({ description: '캠페인 token', example: 'CAMPAIGN_TOKEN' })
	@Expose()
	@IsNotEmpty()
	@IsString()
	token: string;

	@ApiProperty({ name: 'click_id', description: '매체 클릭 식별자', example: 'click-0001' })
	@Expose({ name: 'click_id' })
	@IsNotEmpty()
	@IsString()
	clickId: string;

	@ApiPropertyOptional({ name: 'pub_id', description: '퍼블리셔 id', example: 'pub-1' })
	@Expose({ name: 'pub_id' })
	@IsOptional()
	@IsString()
	pubId: string;

	@ApiPropertyOptional({ name: 'sub_id', description: '서브 퍼블리셔 id', example: 'sub-1' })
	@Expose({ name: 'sub_id' })
	@IsOptional()
	@IsString()
	subId: string;

	@ApiPropertyOptional({ description: 'Android 광고 식별자(GAID)', example: '38400000-8cf0-11bd-b23e-10b96e40000d' })
	@Expose()
	@IsOptional()
	@IsString()
	adid: string;

	@ApiPropertyOptional({ description: 'iOS 광고 식별자', example: '6D92078A-8246-4BA4-AE5B-76104861E7DC' })
	@Expose()
	@IsOptional()
	@IsString()
	idfa: string;

	@ApiPropertyOptional({ description: '기기 uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
	@Expose()
	@IsOptional()
	@IsString()
	uuid: string;
}
