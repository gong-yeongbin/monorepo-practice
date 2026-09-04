import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	flexRender,
	createColumnHelper,
} from '@tanstack/react-table';
import { getCell } from '@/shared/lib/get-cell';
import { getTotal } from '@/shared/lib/get-total';
import { TableStyles } from '@/app/global-styles';

interface DashboardColumns {
	idx: string;
	name: string;
	platform: string;
	click: string;
	install: string;
	registration: string;
	retention: string;
	purchase: string;
	revenue: string;
	etc1: string;
	etc2: string;
	etc3: string;
	etc4: string;
	etc5: string;
}

const columnHelper = createColumnHelper<DashboardColumns>();

const DashboardTable = (props: { data: Array<DashboardColumns> }) => {
	const { data } = props;

	const dataWithName = useMemo(() => data.filter(item => item.name !== null), [data]);

	const navigate = useNavigate();

	const handleNameClick = async (rowValues: DashboardColumns) => {
		navigate(`/${rowValues.idx}`);
	};

	const columns = useMemo(
		() => [
			columnHelper.accessor('idx', {}),
			columnHelper.accessor('name', {
				header: '광고앱',
				size: 190,
				minSize: 90,
				cell: info => (
					<span
						role="button"
						tabIndex={0}
						onClick={() => handleNameClick(info.row.original)}
						onKeyDown={() => handleNameClick(info.row.original)}
						style={{ cursor: 'pointer' }}
					>
						{info.getValue()}
					</span>
				),
				footer: () => <div className="total frozen">합계</div>,
			}),
			columnHelper.accessor('platform', { size: 60, minSize: 50 }),
			columnHelper.accessor('click', {
				header: 'click',
				size: 140,
				cell: info => getCell.normal(info),
				footer: info => getTotal(info),
			}),
			columnHelper.accessor('install', {
				header: 'install',
				cell: info => getCell.normal(info),
				footer: info => getTotal(info),
			}),
			columnHelper.accessor(row => row.retention.replace(/\B(?=(\d{3})+(?!\d))/g, ','), {
				id: 'retention',
				header: 'retention',
				minSize: 80,
				footer: info => getTotal(info),
			}),
			columnHelper.accessor(row => row.purchase.replace(/\B(?=(\d{3})+(?!\d))/g, ','), {
				id: 'purchase',
				header: 'purchase',
				minSize: 80,
				footer: info => getTotal(info),
			}),
			columnHelper.accessor(row => row.revenue.replace(/\B(?=(\d{3})+(?!\d))/g, ','), {
				id: 'revenue',
				header: 'revenue',
				size: 140,
				minSize: 80,
				footer: info => getTotal(info),
			}),
			columnHelper.accessor(row => row.registration.replace(/\B(?=(\d{3})+(?!\d))/g, ','), {
				id: 'registration',
				header: 'registration',
				minSize: 105,
				footer: info => getTotal(info),
			}),
			columnHelper.accessor('etc1', {
				header: 'etc1',
				size: 80,
				minSize: 50,
				footer: info => getTotal(info),
			}),
			columnHelper.accessor('etc2', { header: 'etc2', size: 55, footer: info => getTotal(info) }),
			columnHelper.accessor('etc3', { header: 'etc3', size: 55, footer: info => getTotal(info) }),
			columnHelper.accessor('etc4', { header: 'etc4', size: 55, footer: info => getTotal(info) }),
			columnHelper.accessor('etc5', { header: 'etc5', size: 55, footer: info => getTotal(info) }),
		],
		[],
	);

	const table = useReactTable({
		data: dataWithName,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		columnResizeMode: 'onChange',
		enableColumnResizing: true,
		initialState: {
			columnVisibility: { idx: false },
			sorting: [
				{ id: 'platform', desc: false },
				{ id: 'name', desc: false },
			],
		},
	});

	return (
		<TableStyles height="calc(var(--vh, 1vh) * 100 - 20rem)">
			<table id="dashboard-table" className="sticky">
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

				<tbody>
					{table.getRowModel().rows.map(row => (
						<tr key={row.id} className="tr">
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
	);
};

export default DashboardTable;
