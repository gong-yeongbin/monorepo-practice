import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from 'react-query';
import { observer } from 'mobx-react';
import { Button, DatePicker, Skeleton, Tooltip, Table as EmptyTable } from 'antd';
import { RangeValue } from 'rc-picker/lib/interface';
import moment, { Moment } from 'moment';
import { SyncOutlined } from '@ant-design/icons';
import { useStore } from '../../../store';
import { Nav, NavLeft, TableContainer } from '../../../globalStyles';
import Table from './Table';
import InfoCard from '../../../components/InfoCard';
import { api } from '../../../api';

const { RangePicker } = DatePicker;

const Daily = observer(() => {
	const store = useStore();

	const endDate = sessionStorage.getItem('endDate');
	const dateWeekAgo = moment(endDate).subtract(7, 'd').format('YYYY-MM-DD').toString();
	const [date, setDate] = useState([dateWeekAgo, endDate]);
	const [isDateOpen, setIsDateOpen] = useState(false);

	const navigate = useNavigate();

	const queryClient = useQueryClient();

	useEffect(() => {
		store.setPageTitle('광고 일별 통계');
	}, []);

	const { isFetching, data } = useQuery(['daily'], () => api.getDaily(date), {
		onError: () => {
			sessionStorage.clear();
			navigate('/login');
		},
		enabled: !!(!isDateOpen && date && date[0] && date[1]),
	});

	const handleRefreshBtn = () => {
		queryClient.invalidateQueries('daily');
	};

	const onDateChange = (_dates: RangeValue<Moment>, dateStrings: [string, string]) => {
		setDate([dateStrings[0], dateStrings[1]]);
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
					<Table data={data} />
				) : (
					<EmptyTable />
				)}
			</TableContainer>
		</>
	);
});

export default Daily;
