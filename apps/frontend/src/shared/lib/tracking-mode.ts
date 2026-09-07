// 트래킹 수용 모드 값과 화면 표기 — backend의 tracking-mode API와 값을 맞춘다
export const TRACKING_MODES = ['open', 'half', 'closed'] as const;

export type TrackingMode = (typeof TRACKING_MODES)[number];

interface TrackingModeMeta {
	label: string;
	description: string;
	// 되돌리는 방향(open)은 안전하므로 확인 없이 적용한다
	confirm: boolean;
}

export const TRACKING_MODE_META: Record<TrackingMode, TrackingModeMeta> = {
	open: { label: '정상', description: '모든 클릭을 받습니다.', confirm: false },
	half: { label: '절반', description: '평균 절반만 통과하고 나머지는 503으로 막습니다.', confirm: true },
	closed: { label: '전면', description: '모든 클릭을 503으로 막습니다.', confirm: true },
};
