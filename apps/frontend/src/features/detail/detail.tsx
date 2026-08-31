import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Button, Tooltip, Table as EmptyTable, DatePicker, message } from 'antd';
import { SyncOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import writeXlsxFile, { getSheetData } from 'write-excel-file/browser';
import { useStore } from '@/app/store';
import Table from '@/features/detail/detail-table';
import InfoCard from '@/shared/ui/info-card/info-card';
import { Nav, NavLeft, NavRight, TableContainer } from '@/app/global-styles';
import { api } from '@/shared/api/api';
import {
	buildPostbackSheets,
	postbackFileName,
	INSTALL_COLUMNS,
	EVENT_COLUMNS,
	UNREGISTERED_COLUMNS,
} from '@/shared/lib/postback-workbook';

const { RangePicker } = DatePicker;

const Detail = () => {
	const startDate = sessionStorage.getItem('startDate');
	const endDate = sessionStorage.getItem('endDate');
	const [date, setDate] = useState([startDate, endDate]);
	const [isDateOpen, setIsDateOpen] = useState(false);
	const [isExporting, setIsExporting] = useState(false);

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

	// 화면에 보이는 모든 캠페인의 포스트백을 한 파일 3시트(install·event·미등록)로 받는다.
	// 캠페인·매체 이름은 backend가 내려주지 않으므로 표 데이터(token 보유)와 조인한다.
	const handleExcelBtn = async () => {
		setIsExporting(true);
		try {
			const logs = await api.getPostbackExport({ paramId, date });
			const sheets = buildPostbackSheets(logs, data ?? []);

			await writeXlsxFile([
				{
					sheet: 'install',
					data: getSheetData(sheets.installs, INSTALL_COLUMNS),
					columns: INSTALL_COLUMNS,
				},
				{
					sheet: 'event',
					data: getSheetData(sheets.events, EVENT_COLUMNS),
					columns: EVENT_COLUMNS,
				},
				{
					sheet: 'unregistered',
					data: getSheetData(sheets.unregistered, UNREGISTERED_COLUMNS),
					columns: UNREGISTERED_COLUMNS,
				},
			]).toFile(postbackFileName(store.info.advertising, date));
		} catch {
			// useQuery가 아니라 QueryCache.onError가 안 잡는다. 다운로드 실패로 세션을 끊지는 않는다.
			message.error('엑셀 다운로드에 실패했습니다.');
		} finally {
			setIsExporting(false);
		}
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
					<Button
						icon={<FileExcelOutlined />}
						onClick={handleExcelBtn}
						loading={isExporting}
						disabled={isFetching || !data || data.length === 0}
					>
						엑셀 다운로드
					</Button>
				</NavRight>
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
