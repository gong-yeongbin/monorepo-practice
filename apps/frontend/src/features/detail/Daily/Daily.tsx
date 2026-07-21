import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { observer } from 'mobx-react';
import { Button, DatePicker, Skeleton, Tooltip, Table as EmptyTable } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { SyncOutlined } from '@ant-design/icons';
import { useStore } from '@/app/store';
import { Nav, NavLeft, TableContainer } from '@/app/globalStyles';
import Table from '@/features/detail/Daily/Table';
import InfoCard from '@/shared/ui/InfoCard/InfoCard';
import { api } from '@/shared/api/api';

const { RangePicker } = DatePicker;

const Daily = observer(() => {
	const store = useStore();

	const endDate = sessionStorage.getItem('endDate');
	const dateWeekAgo = dayjs(endDate).subtract(7, 'd').format('YYYY-MM-DD').toString();
	const [date, setDate] = useState([dateWeekAgo, endDate]);
	const [isDateOpen, setIsDateOpen] = useState(false);

	const queryClient = useQueryClient();

	useEffect(() => {
		store.setPageTitle('광고 일별 통계');
	}, []);

	const { isFetching, data } = useQuery({
		queryKey: ['daily'],
		queryFn: () => api.getDaily(date),
		enabled: !!(!isDateOpen && date && date[0] && date[1]),
	});

	const handleRefreshBtn = () => {
		queryClient.invalidateQueries({ queryKey: ['daily'] });
	};

	const onDateChange = (_dates: (Dayjs | null)[] | null, dateStrings: [string, string]) => {
		setDate([dateStrings[0], dateStrings[1]]);
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
					<Table data={data} />
				) : (
					<EmptyTable />
				)}
			</TableContainer>
		</>
	);
});

export default Daily;
