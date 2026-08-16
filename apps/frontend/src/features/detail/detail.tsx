import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Button, Tooltip, Table as EmptyTable, DatePicker } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { useStore } from '@/app/store';
import Table from '@/features/detail/detail-table';
import InfoCard from '@/shared/ui/info-card/info-card';
import { Nav, NavLeft, NavRight, TableContainer } from '@/app/global-styles';
import { api } from '@/shared/api/api';

const { RangePicker } = DatePicker;

const Detail = () => {
	const startDate = sessionStorage.getItem('startDate');
	const endDate = sessionStorage.getItem('endDate');
	const [date, setDate] = useState([startDate, endDate]);
	const [isDateOpen, setIsDateOpen] = useState(false);

	const store = useStore();

	const { id: paramId } = useParams();

	const queryClient = useQueryClient();

	useEffect(() => {
		store.setPageTitle('광고 상세');
	}, []);

	const { isFetching, data } = useQuery({
		queryKey: ['detail', { paramId }],
		queryFn: () => api.getDetail({ date, paramId }),
		enabled: !!(!isDateOpen && date && date[0] && date[1]),
	});

	const handleRefreshBtn = () => {
		queryClient.invalidateQueries({ queryKey: ['detail'] });
	};

	const onDateChange = (dates: (Dayjs | null)[] | null, dateStrings: [string, string]) => {
		if (dates) {
			setDate([dateStrings[0], dateStrings[1]]);
		}
		sessionStorage.setItem('startDate', dateStrings[0]);
		sessionStorage.setItem('endDate', dateStrings[1]);
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
						value={[dayjs(date[0]), dayjs(date[1])]}
						onChange={onDateChange}
						onOpenChange={onOpenChange}
						disabledDate={disabledDate}
						disabled={isFetching}
						allowClear={false}
						style={{ marginRight: '1rem', marginBottom: '1rem' }}
					/>
					<Tooltip title="새로고침" color="var(--grey)">
						<Button icon={<SyncOutlined />} onClick={handleRefreshBtn} disabled={isFetching} />
					</Tooltip>
				</NavLeft>
				<NavRight />
			</Nav>

			<TableContainer>
				{data && data.length > 0 ? (
					<Table data={data} />
				) : (
					<EmptyTable />
				)}
			</TableContainer>
		</>
	);
};

export default Detail;
