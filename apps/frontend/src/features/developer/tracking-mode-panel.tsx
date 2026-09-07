// 트래킹 수용 모드를 조회·변경하는 개발자 전용 패널 — 실서비스 클릭을 막는 스위치라 차단 방향은 확인을 받는다
import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal, Radio, Space, Spin, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { TRACKING_MODE_META, TRACKING_MODES, TrackingMode } from '@/shared/lib/tracking-mode';
import { PanelDescription, PanelSection, RadioOptionDescription } from '@/features/developer/tracking-mode-panel.styles';

const TrackingModePanel = () => {
	const queryClient = useQueryClient();
	const { data: mode, isLoading } = useQuery({ queryKey: ['trackingMode'], queryFn: api.getTrackingMode });

	// 라디오 선택은 즉시 반영하지 않고 [적용]을 눌러야 저장한다 — 실수로 클릭이 멈추는 것을 막는다
	const [selected, setSelected] = useState<TrackingMode>('open');

	// 서버 값이 도착하거나 다른 곳에서 바뀌면 선택을 맞춘다
	useEffect(() => {
		if (mode) setSelected(mode);
	}, [mode]);

	const mutation = useMutation({
		mutationFn: api.updateTrackingMode,
		onSuccess: () => {
			message.success('저장했습니다. 각 서버에 최대 3초 뒤 반영됩니다.');
			queryClient.invalidateQueries({ queryKey: ['trackingMode'] });
		},
	});

	const submit = () => {
		const meta = TRACKING_MODE_META[selected];
		if (!meta.confirm) {
			mutation.mutate(selected);
			return;
		}

		Modal.confirm({
			title: `트래킹을 '${meta.label}' 모드로 바꿉니다`,
			content: `${meta.description} 광고 클릭이 트래커로 전달되지 않고 클릭 집계도 되지 않습니다.`,
			okText: '차단하기',
			okButtonProps: { danger: true },
			cancelText: '취소',
			onOk: () => mutation.mutate(selected),
		});
	};

	if (isLoading) return <Spin />;

	return (
		<PanelSection>
			{mode && mode !== 'open' && (
				<Alert
					type="error"
					showIcon
					title={`현재 트래킹이 '${TRACKING_MODE_META[mode].label}' 모드입니다`}
					description={TRACKING_MODE_META[mode].description}
				/>
			)}

			<PanelDescription>
				점검·긴급 상황에 트래킹 클릭 수용 여부를 제어합니다. 차단된 클릭은 503으로 응답하며 집계되지 않습니다.
				요청자를 구분하지 않으므로 어뷰징 방어용이 아닙니다.
			</PanelDescription>

			<Radio.Group value={selected} onChange={event => setSelected(event.target.value as TrackingMode)}>
				<Space orientation="vertical">
					{TRACKING_MODES.map(value => (
						<Radio key={value} value={value}>
							{TRACKING_MODE_META[value].label}
							<RadioOptionDescription>{TRACKING_MODE_META[value].description}</RadioOptionDescription>
						</Radio>
					))}
				</Space>
			</Radio.Group>

			<div>
				<Button type="primary" disabled={selected === mode} loading={mutation.isPending} onClick={submit}>
					적용
				</Button>
			</div>
		</PanelSection>
	);
};

export default TrackingModePanel;
