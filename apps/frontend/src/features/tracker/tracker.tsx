import React, { useEffect } from 'react';
import { Table as EmptyTable } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { PaddingContainer, TableContainer } from '@/app/global-styles';
import { useStore } from '@/app/store';
import Table from '@/features/tracker/tracker-table';
import { api } from '@/shared/api/api';

const Tracker = () => {
	const store = useStore();

	useEffect(() => {
		store.setPageTitle('트래커 관리');
	}, []);

	const { data } = useQuery({ queryKey: ['trackers'], queryFn: api.getTrackers });

	return (
		<PaddingContainer>
			<TableContainer>
				{data?.length > 0 ? (
					<Table data={data} />
				) : (
					<EmptyTable />
				)}
			</TableContainer>
		</PaddingContainer>
	);
};

export default Tracker;
