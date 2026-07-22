import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMediaDto {
	@ApiProperty({ description: '매체 이름', example: '테스트 매체' })
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({ description: 'install 포스트백을 전달할 매체 URL', example: 'https://media.example.com/install?click_id={click_id}' })
	@IsNotEmpty()
	@IsString()
	install_postback_url: string;

	@ApiProperty({ description: 'event 포스트백을 전달할 매체 URL', example: 'https://media.example.com/event?click_id={click_id}&event={event}' })
	@IsNotEmpty()
	@IsString()
	event_postback_url: string;
}
