import { IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

enum Type {
	CPI,
	CPA,
}

export class CreateCampaignDto {
	@IsString()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	name: string;

	@IsEnum(Type)
	@Transform(({ value }) => value.replaceAll(' ', ''))
	type: Type;

	@IsString()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	trackerName: string;

	@IsString()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	advertisingName: string;

	@IsString()
	@Transform(({ value }) => value.replaceAll(' ', ''))
	mediaName: string;
}
