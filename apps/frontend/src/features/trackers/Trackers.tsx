import React, { useEffect } from 'react';
import { Skeleton, Table as EmptyTable } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { PaddingContainer, TableContainer } from '@/app/globalStyles';
import { useStore } from '@/app/store';
import Table from '@/features/trackers/Table';
import { api } from '@/shared/api/api';

const Trackers = () => {
	const store = useStore();

	useEffect(() => {
		store.setPageTitle('트래커 관리');
	}, []);

	const { isFetching, data } = useQuery({ queryKey: ['trackers'], queryFn: api.getTrackers });

	return (
		<PaddingContainer>
			<TableContainer>
				{isFetching ? (
					<Skeleton active title={false} paragraph={{ width: '100%', rows: 11 }} />
				) : data?.length > 0 ? (
					<Table data={data} />
				) : (
					<EmptyTable />
				)}
			</TableContainer>
		</PaddingContainer>
	);
};

export default Trackers;
