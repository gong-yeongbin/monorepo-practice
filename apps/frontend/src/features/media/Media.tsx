import React, { useEffect } from 'react';
import { Skeleton, Table as EmptyTable } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { PaddingContainer, TableContainer } from '@/app/globalStyles';
import { useStore } from '@/app/store';
import Table from '@/features/media/Table';
import { api } from '@/shared/api/api';

const Media = () => {
	const store = useStore();

	useEffect(() => {
		store.setPageTitle('매체 관리');
	}, []);

	const { isFetching, data } = useQuery({ queryKey: ['media'], queryFn: api.getMedia });

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

export default Media;
