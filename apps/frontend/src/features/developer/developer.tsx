// 개발자 전용 화면 — 사용자 목록·가입 승인·로그인 기록(보안 감사)과 트래킹 수용 모드를 관리한다
import React, { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { Table as EmptyTable, Tabs } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { PaddingContainer, TableContainer } from '@/app/global-styles';
import { useStore } from '@/app/store';
import UserTable, { UserColumns } from '@/features/developer/user-table';
import LoginHistoryTable from '@/features/developer/login-history-table';
import TrackingModePanel from '@/features/developer/tracking-mode-panel';
import { api } from '@/shared/api/api';

const Developer = observer(() => {
	const store = useStore();

	useEffect(() => {
		store.setPageTitle('개발자 메뉴');
	}, []);

	// 전체를 한 번만 받아 탭에서 나눈다(승인 대기는 approved=false로 따로 조회할 수도 있지만 쿼리가 둘로 늘어난다)
	const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => api.getUsers() });
	// 허용 광고 옵션. 서버 페이징 전환 전과 동일하게 100건까지만 받는다(전체 목록 수신은 별도 작업)
	const { data: advertising } = useQuery({
		queryKey: ['advertising', 'options'],
		queryFn: () => api.getAdvertising({ searchWords: '', page: 1, pageSize: 100 }),
	});

	const advertisingOptions = useMemo(
		() => (advertising?.items ?? []).map((row: { idx: string; name: string }) => ({ idx: row.idx, name: row.name })),
		[advertising],
	);

	const pending = useMemo(() => (users ?? []).filter((user: UserColumns) => !user.approved), [users]);

	const renderTable = (rows: UserColumns[]) =>
		rows.length > 0 ? <UserTable data={rows} advertisingOptions={advertisingOptions} /> : <EmptyTable />;

	return (
		<PaddingContainer>
			<TableContainer>
				<Tabs
					items={[
						{ key: 'all', label: '전체 사용자', children: renderTable(users ?? []) },
						{ key: 'pending', label: `승인 대기 (${pending.length})`, children: renderTable(pending) },
						// 탭을 열 때만 조회된다(antd Tabs는 비활성 탭 내용을 처음 열기 전까지 렌더하지 않는다)
						{ key: 'login-history', label: '로그인 기록', children: <LoginHistoryTable /> },
						{ key: 'tracking', label: '트래킹 제어', children: <TrackingModePanel /> },
					]}
				/>
			</TableContainer>
		</PaddingContainer>
	);
});

export default Developer;
