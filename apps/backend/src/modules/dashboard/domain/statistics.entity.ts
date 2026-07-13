// 대시보드 통계 집계 결과 타입(daily_report 합산)

// daily_report의 카운터 합계(공통)
export interface ReportCounters {
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

// 대시보드(admin getAdvertisingStatistics): 특정 일자, advertising별 합산
export interface DashboardRow extends ReportCounters {
	advertising_id: number;
	advertising_name: string;
}

// 일별 통계(admin getDailyStatistics): token 기준, 날짜별 합산
export interface DailyRow extends ReportCounters {
	created_date: Date;
	unregistered: number;
}

// 상세 통계(admin getAdvertisingDetail): advertising별, 매체·캠페인 단위 합산
export interface DetailRow extends ReportCounters {
	media_id: number;
	media_name: string;
	token: string;
	campaign_id: number;
	campaign_name: string;
	type: string;
	unregistered: number;
	is_active: boolean;
}
