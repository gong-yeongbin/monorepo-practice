import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from 'react-query';
import { observer } from 'mobx-react';
import { Button, DatePicker, Skeleton, Tooltip, Table as EmptyTable } from 'antd';
import { RangeValue } from 'rc-picker/lib/interface';
import moment, { Moment } from 'moment';
import { SyncOutlined } from '@ant-design/icons';
import Table from './Table';
import { useStore } from '../../../../store';
import InfoCard from '../../../../components/InfoCard';
import { Nav, NavLeft, TableContainer } from '../../../../globalStyles';
import { api } from '../../../../api';

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

	const { isFetching, data } = useQuery(
		['dailyDetail', { orderType, order }],
		() => api.getDailyDetail({ date, orderType, order }),
		{
			onError: (error: unknown) => {
				handleErrors(error);
			},
			enabled: !!(!isDateOpen && date && date[0] && date[1]),
		},
	);

	const handleErrors = (error: unknown) => {
		if (error instanceof Error && error.message.includes('400')) {
			navigate('/');
		} else {
			sessionStorage.clear();
			navigate('/login');
		}
	};

	const handleRefreshBtn = () => {
		queryClient.invalidateQueries('dailyDetail');
	};

	const onDateChange = (_dates: RangeValue<Moment>, dateStrings: [string, string]) => {
		setDate([dateStrings[0], dateStrings[1]]);
		sessionStorage.setItem('dailyDetailStartDate', dateStrings[0]);
		sessionStorage.setItem('dailyDetailEndDate', dateStrings[1]);
	};

	const onOpenChange = (open: boolean) => {
		setIsDateOpen(open);
	};

	const disabledDate = (selectedDate: Moment): boolean => {
		return selectedDate && selectedDate > moment().endOf('day');
	};

	return (
		<>
			<InfoCard />

			<Nav>
				<NavLeft>
					<RangePicker
						ranges={{
							오늘: [moment(), moment()],
							'이번 달': [moment().startOf('month'), moment()],
						}}
						style={{ marginRight: '1rem', marginBottom: '1rem' }}
						value={[moment(date[0]), moment(date[1])]}
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
