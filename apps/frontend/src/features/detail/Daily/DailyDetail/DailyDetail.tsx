import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { observer } from 'mobx-react';
import { Button, DatePicker, Skeleton, Tooltip, Table as EmptyTable } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { SyncOutlined } from '@ant-design/icons';
import Table from '@/features/detail/Daily/DailyDetail/Table';
import { useStore } from '@/app/store';
import InfoCard from '@/shared/ui/InfoCard/InfoCard';
import { Nav, NavLeft, TableContainer } from '@/app/globalStyles';
import { api } from '@/shared/api/api';

const { RangePicker } = DatePicker;

const DailyDetail = observer(() => {
	const store = useStore();

	const [date, setDate] = useState([
		sessionStorage.getItem('dailyDetailStartDate'),
		sessionStorage.getItem('dailyDetailEndDate'),
	]);
	const [isDateOpen, setIsDateOpen] = useState(false);
	const [orderType, setOrderType] = useState('install');
	const [order, setOrder] = useState('desc');

	const navigate = useNavigate();

	const queryClient = useQueryClient();

	useEffect(() => {
		store.setPageTitle('광고 일별 통계 상세');
	}, []);

	const { isFetching, data, error } = useQuery({
		queryKey: ['dailyDetail', { orderType, order }],
		queryFn: () => api.getDailyDetail({ date, orderType, order }),
		enabled: !!(!isDateOpen && date && date[0] && date[1]),
	});

	const handleErrors = (err: unknown) => {
		if (err instanceof Error && err.message.includes('400')) {
			navigate('/');
		} else {
			sessionStorage.clear();
			navigate('/login');
		}
	};

	useEffect(() => {
		if (error) {
			handleErrors(error);
		}
	}, [error]);

	const handleRefreshBtn = () => {
		queryClient.invalidateQueries({ queryKey: ['dailyDetail'] });
	};

	const onDateChange = (_dates: (Dayjs | null)[] | null, dateStrings: [string, string]) => {
		setDate([dateStrings[0], dateStrings[1]]);
		sessionStorage.setItem('dailyDetailStartDate', dateStrings[0]);
		sessionStorage.setItem('dailyDetailEndDate', dateStrings[1]);
	};

	const onOpenChange = (open: boolean) => {
		setIsDateOpen(open);
	};

	const disabledDate = (selectedDate: Dayjs): boolean => {
		return selectedDate && selectedDate > dayjs().endOf('day');
	};

	return (
		<>
			<InfoCard />

			<Nav>
				<NavLeft>
					<RangePicker
						ranges={{
							오늘: [dayjs(), dayjs()],
							'이번 달': [dayjs().startOf('month'), dayjs()],
						}}
						style={{ marginRight: '1rem', marginBottom: '1rem' }}
						value={[dayjs(date[0]), dayjs(date[1])]}
						allowClear={false}
						onChange={onDateChange}
						onOpenChange={onOpenChange}
						disabled={isFetching}
						disabledDate={disabledDate}
					/>
					<Tooltip title="새로고침" color="var(--grey)">
						<Button icon={<SyncOutlined />} onClick={handleRefreshBtn} disabled={isFetching} />
					</Tooltip>
				</NavLeft>
			</Nav>

			<TableContainer>
				{isFetching ? (
					<Skeleton active title={false} paragraph={{ width: '100%', rows: 11 }} />
				) : data && data.length > 0 ? (
					<Table
						orderType={orderType}
						setOrderType={setOrderType}
						order={order}
						setOrder={setOrder}
						data={data}
					/>
				) : (
					<EmptyTable />
				)}
			</TableContainer>
		</>
	);
});

export default DailyDetail;
