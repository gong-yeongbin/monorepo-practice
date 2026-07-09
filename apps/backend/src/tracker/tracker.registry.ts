import { ClassConstructor, plainToInstance } from 'class-transformer';
import { AppsflyerTracking } from '@tracker/appsflyer/tracking.dto';
import { AppsflyerInstall } from '@tracker/appsflyer/install.dto';
import { AppsflyerEvent } from '@tracker/appsflyer/event.dto';
import { AirbridgeTracking } from '@tracker/airbridge/tracking.dto';
import { AirbridgeInstall } from '@tracker/airbridge/install.dto';
import { AirbridgeEvent } from '@tracker/airbridge/event.dto';
import { AdjustTracking } from '@tracker/adjust/tracking.dto';
import { AdjustInstall } from '@tracker/adjust/install.dto';
import { AdjustEvent } from '@tracker/adjust/event.dto';
import { AdbrixremasterTracking } from '@tracker/adbrix-remaster/tracking.dto';
import { AdbrixremasterInstall } from '@tracker/adbrix-remaster/install.dto';
import { AdbrixremasterEvent } from '@tracker/adbrix-remaster/event.dto';

// install/event 포스트백 DTO가 공통으로 노출해야 하는 필드
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

// class-transformer 기반 매핑은 트래커 경계 안에만 두고 바깥에는 순수 함수로 노출한다
const toTracking =
	(cls: ClassConstructor<object>) =>
	(params: Record<string, unknown>): Record<string, string | undefined> =>
		plainToInstance(cls, params, { excludeExtraneousValues: true }) as Record<string, string | undefined>;

const toPostback =
	<T extends TrackerPostback>(cls: ClassConstructor<T>) =>
	(query: Record<string, string>): T =>
		plainToInstance(cls, query, { excludeExtraneousValues: true });

// 새 트래커 추가 시 tracker/<이름>/ 폴더에 DTO 3개를 만들고 여기에 한 줄 등록한다
export const TRACKERS: Record<string, TrackerDefinition> = {
	appsflyer: { tracking: toTracking(AppsflyerTracking), install: toPostback(AppsflyerInstall), event: toPostback(AppsflyerEvent) },
	airbridge: { tracking: toTracking(AirbridgeTracking), install: toPostback(AirbridgeInstall), event: toPostback(AirbridgeEvent) },
	adjust: { tracking: toTracking(AdjustTracking), install: toPostback(AdjustInstall), event: toPostback(AdjustEvent) },
	'adbrix-remaster': { tracking: toTracking(AdbrixremasterTracking), install: toPostback(AdbrixremasterInstall), event: toPostback(AdbrixremasterEvent) },
};

export const TRACKER_NAMES = Object.keys(TRACKERS);
