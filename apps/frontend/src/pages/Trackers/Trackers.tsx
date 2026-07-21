import React, { useEffect } from 'react';
import { Skeleton, Table as EmptyTable } from 'antd';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { PaddingContainer, TableContainer } from '../../globalStyles';
import { useStore } from '../../store';
import Table from './Table';
import { api } from '../../api';

const Trackers = () => {
	const store = useStore();

	const navigate = useNavigate();

	useEffect(() => {
		store.setPageTitle('트래커 관리');
	}, []);

	const { isFetching, data } = useQuery(['trackers'], api.getTrackers, {
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

export default Trackers;
