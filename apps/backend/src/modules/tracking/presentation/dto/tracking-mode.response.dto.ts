// 트래킹 모드 조회 응답 스키마(Swagger 문서용)
import { ApiProperty } from '@nestjs/swagger';
import { TRACKING_MODES, TrackingMode } from '@tracking/domain/tracking-mode.entity';

export class TrackingModeResponse {
	@ApiProperty({ description: '현재 트래킹 수용 모드', enum: TRACKING_MODES, example: 'open' })
	mode: TrackingMode;
}
