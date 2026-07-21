import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Skeleton, Table as EmptyTable } from 'antd';
import moment, { Moment } from 'moment';
import { useQuery } from 'react-query';
import DashboardTable from './Table';
import { useStore } from '../../store';
import { TableContainer } from '../../globalStyles';
import { StyledDatePicker } from './Dashboard.style';
import { api } from '../../api';

const today = moment().format('YYYY-MM-DD');

const Dashboard = observer(() => {
	const [date, setDate] = useState(today);

	const store = useStore();

	const navigate = useNavigate();

	const accessToken = sessionStorage.getItem('accessToken');

	useEffect(() => {
		sessionStorage.setItem('startDate', today);
		sessionStorage.setItem('endDate', today);
		store.setPageTitle('Dashboard');
	}, []);

	const { isFetching, data } = useQuery(['dashboard', date], () => api.getDashboardData(date), {
		onError: () => {
			sessionStorage.clear();
			navigate('/login');
		},
		enabled: !!accessToken,
	});

	const onDateChange = (_date: any, dateString: string) => {
		setDate(dateString);
		sessionStorage.setItem('startDate', dateString);
		sessionStorage.setItem('endDate', dateString);
	};

	const disabledDate = (selectedDate: Moment): boolean => {
		return selectedDate && selectedDate > moment().endOf('day');
	};

	return (
		<>
			<StyledDatePicker
				defaultValue={moment(date)}
				value={moment(date)}
				allowClear={false}
				onChange={onDateChange}
				disabled={isFetching}
				disabledDate={disabledDate}
			/>
			<TableContainer>
				{isFetching ? (
					<Skeleton active title={false} paragraph={{ width: '100%', rows: 11 }} />
				) : data?.length > 0 ? (
					<DashboardTable data={data} />
				) : (
					<EmptyTable />
				)}
			</TableContainer>
		</>
	);
});

export default Dashboard;
