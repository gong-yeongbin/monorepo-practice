import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { TRACKING_MODES, TrackingMode } from '@tracking/domain/tracking-mode.entity';

// 트래킹 모드 변경 요청 본문
export class ChangeTrackingModeDto {
	@ApiProperty({ description: '트래킹 수용 모드', enum: TRACKING_MODES, example: 'closed' })
	@IsIn(TRACKING_MODES)
	mode: TrackingMode;
}
