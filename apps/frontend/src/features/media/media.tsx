import React, { useEffect } from 'react';
import { Table as EmptyTable } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { PaddingContainer, TableContainer } from '@/app/global-styles';
import { useStore } from '@/app/store';
import Table from '@/features/media/media-table';
import { api } from '@/shared/api/api';

const Media = () => {
	const store = useStore();

	useEffect(() => {
		store.setPageTitle('매체 관리');
	}, []);

	const { data } = useQuery({ queryKey: ['media'], queryFn: api.getMedia });

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

export default Media;
