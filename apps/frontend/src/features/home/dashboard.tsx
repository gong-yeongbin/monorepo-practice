import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Skeleton, Table as EmptyTable } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import DashboardTable from '@/features/home/dashboard-table';
import { useStore } from '@/app/store';
import { TableContainer } from '@/app/global-styles';
import { StyledDatePicker } from '@/features/home/dashboard.styles';
import { api } from '@/shared/api/api';

const today = dayjs().format('YYYY-MM-DD');

const Dashboard = observer(() => {
	const [date, setDate] = useState(today);

	const store = useStore();

	const accessToken = sessionStorage.getItem('accessToken');

	useEffect(() => {
		sessionStorage.setItem('startDate', today);
		sessionStorage.setItem('endDate', today);
		store.setPageTitle('Dashboard');
	}, []);

	const { isFetching, data } = useQuery({
		queryKey: ['dashboard', date],
		queryFn: () => api.getDashboardData(date),
		enabled: !!accessToken,
	});

	const onDateChange = (_date: any, dateString: string | string[] | null) => {
		const value = Array.isArray(dateString) ? dateString[0] : dateString ?? '';
		setDate(value);
		sessionStorage.setItem('startDate', value);
		sessionStorage.setItem('endDate', value);
	};

	const disabledDate = (selectedDate: Dayjs): boolean => {
		return selectedDate && selectedDate > dayjs().endOf('day');
	};

	return (
		<>
			<StyledDatePicker
				defaultValue={dayjs(date)}
				value={dayjs(date)}
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
