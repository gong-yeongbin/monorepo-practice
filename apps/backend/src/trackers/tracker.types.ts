// 트래커 연동이 공유하는 포스트백 필드와 트래커 정의 타입
// install/event 포스트백 mapper가 공통으로 노출해야 하는 필드
export interface TrackerPostback {
	clickId: string;
	viewCode: string;
	token: string;
	adid: string | null;
	idfa: string | null;
	ip: string;
	countryCode: string;
	clickedAt?: Date | string;
	installedAt: Date | string;
	eventedAt?: Date | string;
	eventName?: string;
	revenueCurrency?: string;
	revenue?: string;
}

export interface TrackerEventPostback extends TrackerPostback {
	eventName: string;
}

export interface TrackerDefinition {
	tracking: (params: Record<string, unknown>) => Record<string, string | undefined>;
	install: (query: Record<string, string>) => TrackerPostback;
	event: (query: Record<string, string>) => TrackerEventPostback;
}
