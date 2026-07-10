import { ClassConstructor, plainToInstance } from 'class-transformer';
import { TrackerDefinition, TrackerPostback } from '@trackers/tracker.types';
import { AppsflyerTracking } from '@trackers/appsflyer/tracking.mapper';
import { AppsflyerInstall } from '@trackers/appsflyer/install.mapper';
import { AppsflyerEvent } from '@trackers/appsflyer/event.mapper';
import { AirbridgeTracking } from '@trackers/airbridge/tracking.mapper';
import { AirbridgeInstall } from '@trackers/airbridge/install.mapper';
import { AirbridgeEvent } from '@trackers/airbridge/event.mapper';
import { AdjustTracking } from '@trackers/adjust/tracking.mapper';
import { AdjustInstall } from '@trackers/adjust/install.mapper';
import { AdjustEvent } from '@trackers/adjust/event.mapper';
import { AdbrixRemasterTracking } from '@trackers/adbrix-remaster/tracking.mapper';
import { AdbrixRemasterInstall } from '@trackers/adbrix-remaster/install.mapper';
import { AdbrixRemasterEvent } from '@trackers/adbrix-remaster/event.mapper';

// class-transformer 기반 매핑은 트래커 경계 안에만 두고 바깥에는 순수 함수로 노출한다
const toTracking =
	(cls: ClassConstructor<object>) =>
	(params: Record<string, unknown>): Record<string, string | undefined> =>
		plainToInstance(cls, params, { excludeExtraneousValues: true }) as Record<string, string | undefined>;

const toPostback =
	<T extends TrackerPostback>(cls: ClassConstructor<T>) =>
	(query: Record<string, string>): T =>
		plainToInstance(cls, query, { excludeExtraneousValues: true });

// 새 트래커 추가 시 trackers/<이름>/ 폴더에 mapper 3개를 만들고 여기에 한 줄 등록한다
export const TRACKERS: Record<string, TrackerDefinition> = {
	appsflyer: { tracking: toTracking(AppsflyerTracking), install: toPostback(AppsflyerInstall), event: toPostback(AppsflyerEvent) },
	airbridge: { tracking: toTracking(AirbridgeTracking), install: toPostback(AirbridgeInstall), event: toPostback(AirbridgeEvent) },
	adjust: { tracking: toTracking(AdjustTracking), install: toPostback(AdjustInstall), event: toPostback(AdjustEvent) },
	'adbrix-remaster': { tracking: toTracking(AdbrixRemasterTracking), install: toPostback(AdbrixRemasterInstall), event: toPostback(AdbrixRemasterEvent) },
};

export const TRACKER_NAMES = Object.keys(TRACKERS);
