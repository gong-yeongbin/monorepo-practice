// 개발자 전용 화면 — 가입 승인과 사용자별 허용 광고 목록을 관리한다
import React, { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { Table as EmptyTable, Tabs } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { PaddingContainer, TableContainer } from '@/app/global-styles';
import { useStore } from '@/app/store';
import UserTable, { UserColumns } from '@/features/developer/user-table';
import { api } from '@/shared/api/api';

const Developer = observer(() => {
	const store = useStore();

	useEffect(() => {
		store.setPageTitle('개발자 메뉴');
	}, []);

	// 전체를 한 번만 받아 탭에서 나눈다(승인 대기는 approved=false로 따로 조회할 수도 있지만 쿼리가 둘로 늘어난다)
	const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => api.getUsers() });
	const { data: advertising } = useQuery({ queryKey: ['advertising'], queryFn: () => api.getAdvertising({ searchWords: '' }) });

	const advertisingOptions = useMemo(
		() => (advertising ?? []).map((row: { idx: string; name: string }) => ({ idx: row.idx, name: row.name })),
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
						{ key: 'pending', label: `승인 대기 (${pending.length})`, children: renderTable(pending) },
						{ key: 'all', label: '전체 사용자', children: renderTable(users ?? []) },
					]}
				/>
			</TableContainer>
		</PaddingContainer>
	);
});

export default Developer;
