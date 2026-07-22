import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTrackerDto {
	@ApiProperty({ description: '트래커 이름', example: 'appsflyer' })
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiProperty({ description: '트래커 클릭 트래킹 URL', example: 'https://app.appsflyer.com/com.example.app' })
	@IsNotEmpty()
	@IsString()
	tracking_url: string;

	@ApiProperty({ description: 'install 포스트백 수신 URL', example: 'https://backend.example.com/appsflyer/install' })
	@IsNotEmpty()
	@IsString()
	install_postback_url: string;

	@ApiProperty({ description: 'event 포스트백 수신 URL', example: 'https://backend.example.com/appsflyer/event' })
	@IsNotEmpty()
	@IsString()
	event_postback_url: string;
}
