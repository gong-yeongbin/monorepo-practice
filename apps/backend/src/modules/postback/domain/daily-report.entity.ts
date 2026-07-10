// 일별 집계 리포트 도메인 타입과 빈 리포트 팩토리
export interface DailyReport {
	view_code: string;
	token: string;
	pub_id: string | null;
	sub_id: string | null;
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
	unregistered: number;
	created_date: Date;
}

// 카운터를 0으로 초기화한 빈 일별 리포트를 만든다 (이후 use-case에서 누산)
export const createDailyReport = (props: { view_code: string; token: string; pub_id: string | null; sub_id: string | null; created_date: Date }): DailyReport => ({
	...props,
	click: 0,
	install: 0,
	registration: 0,
	retention: 0,
	purchase: 0,
	revenue: 0,
	etc1: 0,
	etc2: 0,
	etc3: 0,
	etc4: 0,
	etc5: 0,
	unregistered: 0,
});
