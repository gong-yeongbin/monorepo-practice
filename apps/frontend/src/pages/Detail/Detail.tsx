import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { observer } from 'mobx-react';
import { Button, Skeleton, Tooltip, Table as EmptyTable, DatePicker } from 'antd';
import { RetweetOutlined, SyncOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { useStore } from '../../store';
import Table from './Table';
import InfoCard from '../../components/InfoCard';
import { Nav, NavBtn, NavLeft, NavRight, TableContainer } from '../../globalStyles';
import ExcelBtn from './Excel';
import { api } from '../../api';

const { RangePicker } = DatePicker;

const Detail = observer(() => {
	const startDate = sessionStorage.getItem('startDate');
	const endDate = sessionStorage.getItem('endDate');
	const [date, setDate] = useState([startDate, endDate]);
	const [isDateOpen, setIsDateOpen] = useState(false);

	const store = useStore();
	const { detail } = store;

	const { id: paramId } = useParams();

	const navigate = useNavigate();

	const queryClient = useQueryClient();

	useEffect(() => {
		store.setPageTitle('광고 상세');
	}, []);

	const { isFetching, data } = useQuery({
		queryKey: ['detail', { paramId }],
		queryFn: () => api.getDetail({ date, paramId }),
		enabled: !!(!isDateOpen && date && date[0] && date[1]),
	});

	useEffect(() => {
		if (data) {
			store.setDetail(data);
		}
	}, [data]);

	const handleRefreshBtn = () => {
		queryClient.invalidateQueries({ queryKey: ['detail'] });
	};

	const handleChangeBtn = () => {
		navigate(`/${paramId}/change`);
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
				<NavRight>
					{isFetching ? (
						<>
							<Skeleton.Button shape="round" style={{ width: '8.5rem' }} />
							<Skeleton.Button shape="round" style={{ width: '8.5rem', marginLeft: '0.5rem' }} />
						</>
					) : (
						<>
							<NavBtn icon={<RetweetOutlined />} onClick={handleChangeBtn}>
								예약 변경
							</NavBtn>
							<ExcelBtn />
						</>
					)}
				</NavRight>
			</Nav>

			<TableContainer>
				{isFetching ? (
					<Skeleton active title={false} paragraph={{ width: '100%', rows: 11 }} />
				) : detail?.length > 0 ? (
					<Table />
				) : (
					<EmptyTable />
				)}
			</TableContainer>
		</>
	);
});

export default Detail;
