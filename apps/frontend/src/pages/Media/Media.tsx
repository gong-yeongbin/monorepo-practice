import React, { useEffect } from 'react';
import { Skeleton, Table as EmptyTable } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { PaddingContainer, TableContainer } from '../../globalStyles';
import { useStore } from '../../store';
import Table from './Table';
import { api } from '../../api';

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
