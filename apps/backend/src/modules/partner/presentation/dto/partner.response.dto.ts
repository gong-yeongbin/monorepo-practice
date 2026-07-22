// partner 통계 응답 스키마(Swagger 문서용). 도메인 PartnerRow와 필드를 동일하게 유지한다
import { PartnerRow } from '@partner/domain/partner.entity';

export class PartnerStatsResponse implements PartnerRow {
	advertising_id: number;

	advertising_name: string;

	click: number;

	install: number;

	registration: number;

	retention: number;

	purchase: number;

	revenue: number;

	etc1: number;

	etc2: number;

	etc3: number;

	etc4: number;

	etc5: number;
}
