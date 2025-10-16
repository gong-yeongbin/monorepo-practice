import { IsOptional, IsString } from 'class-validator';

export class TrackingDto {
	@IsString()
	token: string;

	@IsString()
	click_id: string;

	@IsString()
	pub_id: string;

	@IsString()
	@IsOptional()
	sub_id: string;

	@IsString()
	@IsOptional()
	adid: string;

	@IsString()
	@IsOptional()
	idfa: string;
}
