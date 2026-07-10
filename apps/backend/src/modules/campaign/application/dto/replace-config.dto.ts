import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

// campaign_config 이벤트 매핑 한 건(admin CampaignEventAddDto의 tracker/admin/media/status 대응)
export class ReplaceConfigDto {
	@IsNotEmpty()
	@IsString()
	tracker_event_name: string;

	@IsNotEmpty()
	@IsString()
	admin_event_name: string;

	@IsNotEmpty()
	@IsString()
	media_event_name: string;

	@IsBoolean()
	send_media: boolean;
}
