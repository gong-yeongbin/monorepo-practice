import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

// campaign_config 이벤트 매핑 한 건(admin CampaignEventAddDto의 tracker/admin/media/status 대응)
export class ReplaceConfigDto {
	@ApiProperty({ description: '트래커가 보내는 이벤트 이름', example: 'af_purchase' })
	@IsNotEmpty()
	@IsString()
	tracker_event_name: string;

	@ApiProperty({ description: '어드민에서 관리하는 이벤트 이름', example: 'purchase' })
	@IsNotEmpty()
	@IsString()
	admin_event_name: string;

	@ApiProperty({ description: '매체로 전달할 이벤트 이름', example: 'purchase' })
	@IsNotEmpty()
	@IsString()
	media_event_name: string;

	@ApiProperty({ description: '매체 포스트백 전송 여부', example: true })
	@IsBoolean()
	send_media: boolean;
}
