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
	// 디바이스 정보 — 트래커마다 내려주는 범위가 달라 원본에 없는 값은 매퍼가 매핑하지 않는다(undefined)
	deviceModel?: string;
	deviceManufacturer?: string;
	deviceType?: string;
	os?: string;
	osVersion?: string;
	carrier?: string;
	// 단말 언어·앱 버전 — appsflyer는 app_version을, singular는 language를 주지 않는다
	language?: string;
	appVersion?: string;
}

export interface TrackerEventPostback extends TrackerPostback {
	eventName: string;
}

export interface TrackerDefinition {
	tracking: (params: Record<string, unknown>) => Record<string, string | undefined>;
	install: (query: Record<string, string>) => TrackerPostback;
	event: (query: Record<string, string>) => TrackerEventPostback;
}
