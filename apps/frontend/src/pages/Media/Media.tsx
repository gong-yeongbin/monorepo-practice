import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton, Table as EmptyTable } from 'antd';
import { useQuery } from 'react-query';
import { PaddingContainer, TableContainer } from '../../globalStyles';
import { useStore } from '../../store';
import Table from './Table';
import { api } from '../../api';

const Media = () => {
	const store = useStore();

	const navigate = useNavigate();

	useEffect(() => {
		store.setPageTitle('매체 관리');
	}, []);

	const { isFetching, data } = useQuery(['media'], api.getMedia, {
		onError: () => {
			sessionStorage.clear();
			navigate('/login');
		},
	});

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
