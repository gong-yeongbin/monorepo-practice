// 트래킹 수용 여부를 나타내는 모드 값과 파싱 규칙
export const TRACKING_MODES = ['open', 'half', 'closed'] as const;

export type TrackingMode = (typeof TRACKING_MODES)[number];

export const DEFAULT_TRACKING_MODE: TrackingMode = 'open';

// 알 수 없는 값은 열어둔다 — 플래그를 못 읽었다고 트래킹을 멈출 이유가 없다
export const parseTrackingMode = (value: string | null | undefined): TrackingMode =>
	TRACKING_MODES.includes(value as TrackingMode) ? (value as TrackingMode) : DEFAULT_TRACKING_MODE;
