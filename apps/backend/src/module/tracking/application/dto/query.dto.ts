import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class QueryDto {
	@Expose()
	@IsNotEmpty()
	@IsString()
	token: string;

	@Expose({ name: 'click_id' })
	@IsNotEmpty()
	@IsString()
	clickId: string;

	@Expose({ name: 'pub_id' })
	@IsOptional()
	@IsString()
	pubId: string;

	@Expose({ name: 'sub_id' })
	@IsOptional()
	@IsString()
	subId: string;

	@Expose()
	@IsOptional()
	@IsString()
	adid: string;

	@Expose()
	@IsOptional()
	@IsString()
	idfa: string;

	@Expose()
	@IsOptional()
	@IsString()
	uuid: string;
}
