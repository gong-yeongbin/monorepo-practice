// partner 통계 집계 결과 타입(오늘자 daily_report를 advertising별로 합산)
export interface PartnerRow {
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
