import React, { useState, useMemo } from 'react';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	createColumnHelper,
} from '@tanstack/react-table';
import { TableStyles } from '@/app/globalStyles';
import { getCell } from '@/shared/lib/getCell';
import InstallModal from '@/shared/ui/Modals/InstallModal';
import EventModal from '@/shared/ui/Modals/EventModal';

export interface IColumns {
	viewCode: string;
	pubId: string;
	subId: string;
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
}

const columnHelper = createColumnHelper<IColumns>();

const DailyDetailTable = (props: {
	orderType: string;
	setOrderType: React.Dispatch<React.SetStateAction<string>>;
	order: string;
	setOrder: React.Dispatch<React.SetStateAction<string>>;
	data: Array<IColumns>;
}) => {
	const { orderType, setOrderType, order, setOrder, data } = props;

	const [installVisible, setInstallVisible] = useState(false);
	const [eventVisible, setEventVisible] = useState(false);

	const handleRowClick = (rowValues: IColumns) => {
		const { viewCode } = rowValues;
		sessionStorage.setItem('viewCode', viewCode);
	};

	const columns = useMemo(
		() => [
			columnHelper.display({
				id: 'no',
				header: 'no',
				size: 40,
				enableSorting: false,
				cell: info => info.row.index + 1,
			}),
			columnHelper.accessor('viewCode', { header: 'view code', minSize: 250, enableSorting: false }),
			columnHelper.accessor('pubId', { header: 'pub id', minSize: 70, enableSorting: false }),
			columnHelper.accessor('subId', { header: 'sub id', minSize: 70, enableSorting: false }),
			columnHelper.accessor('click', {
				header: 'click',
				minSize: 80,
				cell: info => getCell.normal(info),
			}),
			columnHelper.accessor('install', {
				header: 'install',
				minSize: 90,
				cell: info => getCell.linkedInstall(info, setInstallVisible),
			}),
			columnHelper.accessor('cvr', {
				header: 'cvr',
				size: 75,
				cell: info => getCell.cvr(info),
				enableSorting: false,
			}),
			columnHelper.accessor('retention', {
				header: 'retention',
				minSize: 105,
				cell: info => getCell.event(info, setEventVisible),
			}),
			columnHelper.accessor('purchase', {
				header: 'purchase',
				minSize: 100,
				cell: info => getCell.event(info, setEventVisible),
			}),
			columnHelper.accessor('revenue', {
				header: 'revenue',
				minSize: 95,
				cell: info => getCell.normal(info),
			}),
			columnHelper.accessor('registration', {
				header: 'registration',
				minSize: 125,
				cell: info => getCell.event(info, setEventVisible),
			}),
			columnHelper.accessor('etc1', {
				header: 'etc1',
				cell: info => getCell.event(info, setEventVisible),
			}),
			columnHelper.accessor('etc2', {
				header: 'etc2',
				cell: info => getCell.event(info, setEventVisible),
			}),
			columnHelper.accessor('etc3', {
				header: 'etc3',
				cell: info => getCell.event(info, setEventVisible),
			}),
			columnHelper.accessor('etc4', {
				header: 'etc4',
				cell: info => getCell.event(info, setEventVisible),
			}),
			columnHelper.accessor('etc5', {
				header: 'etc5',
				cell: info => getCell.event(info, setEventVisible),
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
			{eventVisible && <EventModal eventVisible={eventVisible} setEventVisible={setEventVisible} />}

			<TableStyles height="calc(var(--vh, 1vh) * 100 - 15rem)">
				<table id="daily-detail-table" className="sticky">
					<thead>
						{table.getHeaderGroups().map(headerGroup => (
							<tr key={headerGroup.id} className="tr">
								{headerGroup.headers.map(header => {
									const canSort = header.column.getCanSort();
									const headerLabel = header.column.columnDef.header;
									return (
										<th key={header.id} className="th">
											{flexRender(headerLabel, header.getContext())}
											<div
												onMouseDown={header.getResizeHandler()}
												onTouchStart={header.getResizeHandler()}
												className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`}
											/>
											<span
												style={{
													verticalAlign: 'middle',
													marginLeft: '4px',
												}}
											>
												{canSort && headerLabel === orderType ? (
													order === 'desc' ? (
														<CaretDownOutlined
															style={{ color: 'var(--blue)' }}
															onClick={() => setOrder('asc')}
														/>
													) : (
														<CaretUpOutlined
															style={{ color: 'var(--blue)' }}
															onClick={() => setOrder('desc')}
														/>
													)
												) : (
													canSort && (
														<FontAwesomeIcon
															style={{ cursor: 'pointer' }}
															icon={faSort}
															onClick={() =>
																setOrderType(
																	typeof headerLabel === 'string' ? headerLabel : 'install',
																)
															}
														/>
													)
												)}
											</span>
										</th>
									);
								})}
							</tr>
						))}
					</thead>

					<tbody>
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
				</table>
			</TableStyles>
		</>
	);
};

export default DailyDetailTable;
