import React, { useState, useMemo } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	createColumnHelper,
} from '@tanstack/react-table';
import { observer } from 'mobx-react';
import { useNavigate, useParams } from 'react-router';
import { useStore } from '../../store';
import InstallModal from '../../components/Modals/InstallModal';
import UnregisteredModal from '../../components/Modals/UnregisteredModal';
import EventModal from '../../components/Modals/EventModal';
import { TableStyles } from '../../globalStyles';
import { getTotal } from '../../getTotal';
import { getCell } from '../../getCell';

export interface IColumns {
	campaignIdx: string;
	campaignName: string;
	type: string;
	status: string;
	createdAt: string;
	mediaIdx: string;
	mediaName: string;
	click: string;
	install: string;
	cvr: number;
	retention: string;
	purchase: string;
	revenue: string;
	registration: string;
	etc1: string;
	etc2: string;
	etc3: string;
	etc4: string;
	etc5: string;
	unregistered: string;
	token: string;
}

const columnHelper = createColumnHelper<IColumns>();

const DetailTable = observer(() => {
	const [installVisible, setInstallVisible] = useState(false);
	const [unregisteredVisible, setUnregisteredVisible] = useState(false);
	const [eventVisible, setEventVisible] = useState(false);

	const store = useStore();
	const { detail } = store;

	const navigate = useNavigate();

	const { id: paramId } = useParams();

	const handleNameClick = () => {
		navigate(`/${paramId}/daily`);
	};

	const handleRowClick = (rowValues: IColumns) => {
		const { mediaName, token } = rowValues;
		sessionStorage.setItem('mediaName', mediaName);
		sessionStorage.setItem('detailToken', token);
	};

	const columns = useMemo(
		() => [
			columnHelper.accessor('token', {}),
			columnHelper.accessor('campaignName', {
				header: 'campaign',
				size: 160,
				minSize: 80,
				cell: info => {
					const { campaignName } = info.row.original;
					return (
						<span
							id="campaign-column"
							role="button"
							tabIndex={0}
							onClick={handleNameClick}
							onKeyDown={handleNameClick}
							style={{ cursor: 'pointer' }}
						>
							{campaignName}
						</span>
					);
				},
				footer: () => <div className="total frozen">합계</div>,
			}),
			columnHelper.accessor('mediaName', { header: 'media', size: 90 }),
			columnHelper.accessor('type', { header: 'type', size: 45 }),
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
			columnHelper.accessor('status', {
				header: '상태',
				size: 55,
				cell: info => getCell.status(info),
			}),
			columnHelper.accessor('createdAt', {
				header: '등록일',
				size: 80,
				cell: info => getCell.createdAt(info),
			}),
		],
		[],
	);

	const table = useReactTable({
		data: detail,
		columns,
		getCoreRowModel: getCoreRowModel(),
		columnResizeMode: 'onChange',
		enableColumnResizing: true,
		initialState: { columnVisibility: { token: false } },
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

			<TableStyles height="calc(var(--vh, 1vh) * 100 - 15rem)">
				<table id="detail-table" className="sticky">
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
								onClick={() => handleRowClick(row.original)}
								onKeyDown={() => handleRowClick(row.original)}
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
		</>
	);
});

export default DetailTable;
