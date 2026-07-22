import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAdvertiserDto {
	@ApiProperty({ description: '광고주 이름', example: '테스트 광고주' })
	@IsNotEmpty()
	@IsString()
	name: string;
}
