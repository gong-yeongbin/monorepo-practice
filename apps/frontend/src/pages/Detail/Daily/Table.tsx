import React, { useState, useMemo } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	createColumnHelper,
	Row,
} from '@tanstack/react-table';
import { useNavigate, useParams } from 'react-router';
import { Button, Table } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { TableStyles } from '../../../globalStyles';
import { getCell } from '../../../getCell';
import { getTotal } from '../../../getTotal';
import InstallModal from '../../../components/Modals/InstallModal';
import UnregisteredModal from '../../../components/Modals/UnregisteredModal';
import EventModal from '../../../components/Modals/EventModal';

export interface IColumns {
	createdAt: string;
	click: string;
	install: string;
	cvr: number;
	registration: string;
	retention: string;
	purchase: string;
	revenue: string;
	etc1: string;
	etc2: string;
	etc3: string;
	etc4: string;
	etc5: string;
	unregistered: string;
}

const columnHelper = createColumnHelper<IColumns>();

const DailyTable = (props: { data: any }) => {
	const { data } = props;

	const [installVisible, setInstallVisible] = useState(false);
	const [unregisteredVisible, setUnregisteredVisible] = useState(false);
	const [eventVisible, setEventVisible] = useState(false);

	const navigate = useNavigate();

	const { id: paramId } = useParams();

	const handleDetailBtnClick = () => {
		navigate(`/${paramId}/daily/detail`);
	};

	const handleRowClick = (row: Row<IColumns>) => {
		const date = row.getValue<string>('date');
		sessionStorage.setItem('dailyDate', `20${date.slice(0, -3)}`);
		sessionStorage.setItem('dailyDetailStartDate', `20${date.slice(0, -3)}`);
		sessionStorage.setItem('dailyDetailEndDate', `20${date.slice(0, -3)}`);
	};

	const columns = useMemo(
		() => [
			columnHelper.accessor(row => dayjs(row.createdAt).locale('ko').format('YY-MM-DD(dd)'), {
				id: 'date',
				header: 'date',
				size: 100,
				minSize: 45,
				footer: () => <div className="total">합계</div>,
			}),
			columnHelper.accessor('click', {
				header: 'click',
				size: 100,
				cell: info => getCell.normal(info),
				footer: info => getTotal(info),
			}),
			columnHelper.accessor('install', {
				header: 'install',
				cell: info => getCell.linkedInstall(info, setInstallVisible),
				footer: info => getTotal(info),
			}),
			columnHelper.accessor('cvr', {
				header: 'cvr',
				size: 75,
				cell: info => getCell.cvr(info),
				footer: info => getTotal(info),
			}),
			columnHelper.accessor('retention', {
				header: 'retention',
				minSize: 80,
				cell: info => getCell.event(info, setEventVisible),
				footer: info => getTotal(info),
			}),
			columnHelper.accessor('purchase', {
				header: 'purchase',
				minSize: 70,
				cell: info => getCell.event(info, setEventVisible),
				footer: info => getTotal(info),
			}),
			columnHelper.accessor('revenue', {
				header: 'revenue',
				size: 95,
				minSize: 65,
				cell: info => getCell.normal(info),
				footer: info => getTotal(info),
			}),
			columnHelper.accessor('registration', {
				header: 'registration',
				size: 105,
				minSize: 100,
				cell: info => getCell.event(info, setEventVisible),
				footer: info => getTotal(info),
			}),
			columnHelper.accessor('etc1', {
				header: 'etc1',
				size: 50,
				minSize: 40,
				cell: info => getCell.event(info, setEventVisible),
				footer: info => getTotal(info),
			}),
			columnHelper.accessor('etc2', {
				header: 'etc2',
				size: 50,
				minSize: 40,
				cell: info => getCell.event(info, setEventVisible),
				footer: info => getTotal(info),
			}),
			columnHelper.accessor('etc3', {
				header: 'etc3',
				size: 55,
				minSize: 40,
				cell: info => getCell.event(info, setEventVisible),
				footer: info => getTotal(info),
			}),
			columnHelper.accessor('etc4', {
				header: 'etc4',
				size: 55,
				minSize: 40,
				cell: info => getCell.event(info, setEventVisible),
				footer: info => getTotal(info),
			}),
			columnHelper.accessor('etc5', {
				header: 'etc5',
				size: 55,
				minSize: 40,
				cell: info => getCell.event(info, setEventVisible),
				footer: info => getTotal(info),
			}),
			columnHelper.accessor('unregistered', {
				header: () => (
					<span style={{ fontSize: '0.5rem', wordBreak: 'keep-all' }}>미등록 이벤트</span>
				),
				size: 45,
				minSize: 45,
				cell: info => getCell.unregistered(info, setUnregisteredVisible),
				footer: info => getTotal(info),
			}),
			columnHelper.display({
				id: 'daily-detail',
				header: '일별상세',
				size: 70,
				minSize: 70,
				cell: () => (
					<Button
						type="link"
						size="small"
						style={{ width: '4rem', color: 'var(--blue)' }}
						onClick={handleDetailBtnClick}
					>
						조회
					</Button>
				),
			}),
		],
		[],
	);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		columnResizeMode: 'onChange',
		enableColumnResizing: true,
	});

	return (
		<>
			{installVisible && (
				<InstallModal installVisible={installVisible} setInstallVisible={setInstallVisible} />
			)}
			{unregisteredVisible && (
				<UnregisteredModal
					unregisteredVisible={unregisteredVisible}
					setUnregisteredVisible={setUnregisteredVisible}
				/>
			)}
			{eventVisible && <EventModal eventVisible={eventVisible} setEventVisible={setEventVisible} />}

			{data.length === 0 ? (
				<Table />
			) : (
				<TableStyles height="calc(var(--vh, 1vh) * 100 - 15rem)">
					<table id="daily-table" className="sticky">
						<thead>
							{table.getHeaderGroups().map(headerGroup => (
								<tr key={headerGroup.id} className="tr">
									{headerGroup.headers.map(header => (
										<th key={header.id} className="th">
											{flexRender(header.column.columnDef.header, header.getContext())}
											<div
												onMouseDown={header.getResizeHandler()}
												onTouchStart={header.getResizeHandler()}
												className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`}
											/>
										</th>
									))}
								</tr>
							))}
						</thead>

						<tbody className="tbody">
							{table.getRowModel().rows.map(row => (
								<tr
									key={row.id}
									role="button"
									tabIndex={0}
									onClick={() => handleRowClick(row)}
									onKeyDown={() => handleRowClick(row)}
									className="tr"
								>
									{row.getVisibleCells().map(cell => (
										<td key={cell.id} className="td">
											<div className="ellipsis">
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</div>
										</td>
									))}
								</tr>
							))}
						</tbody>

						<tfoot className="sticky">
							{table.getFooterGroups().map(footerGroup => (
								<tr key={footerGroup.id}>
									{footerGroup.headers.map(header => (
										<td key={header.id}>
											{flexRender(header.column.columnDef.footer, header.getContext())}
										</td>
									))}
								</tr>
							))}
						</tfoot>
					</table>
				</TableStyles>
			)}
		</>
	);
};

export default DailyTable;
