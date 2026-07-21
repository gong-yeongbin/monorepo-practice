import React, { useMemo, useState, ChangeEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	flexRender,
	createColumnHelper,
	Column,
} from '@tanstack/react-table';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { getCell } from '@/shared/lib/getCell';
import { getTotal } from '@/shared/lib/getTotal';
import { TableStyles } from '@/app/globalStyles';
import { NameSearchBar, PlatformHeader } from '@/features/home/Dashboard.style';

interface IColumns {
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

const platformKeys = {
	all: 'All',
	aos: 'AOS',
	ios: 'iOS',
};
const { all, aos, ios } = platformKeys;
const platforms: MenuProps['items'] = [
	{
		label: all,
		key: all,
	},
	{
		label: aos,
		key: aos,
	},
	{
		label: ios,
		key: ios,
	},
];

const columnHelper = createColumnHelper<IColumns>();

const DashboardTable = (props: { data: Array<IColumns> }) => {
	const { data } = props;

	const [dataWithName] = useState(data.filter(item => item.name !== null));
	const [selectedPlatform, setSelectedPlatform] = useState(all);

	const navigate = useNavigate();

	const handleNameClick = async (rowValues: IColumns) => {
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
		[selectedPlatform],
	);

	const table = useReactTable({
		data: dataWithName,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
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

	const renderNameFilter = (column: Column<IColumns, unknown>, size: number) => {
		const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
			column.setFilterValue(e.target.value || undefined);
		};
		const handleEscPress = (e: KeyboardEvent) => {
			if (e.code === 'Escape') {
				column.setFilterValue(undefined);
			}
		};
		return (
			size > 100 && (
				<NameSearchBar
					value={(column.getFilterValue() as string) || ''}
					onChange={handleChange}
					onKeyDown={handleEscPress}
					prefix={<SearchOutlined />}
					size="small"
					allowClear
				/>
			)
		);
	};

	const renderPlatformFilter = (column: Column<IColumns, unknown>) => {
		const handleClick = (menuEvent: { key: string }) => {
			const { key } = menuEvent;
			if (key === all) {
				column.setFilterValue(undefined);
			} else {
				column.setFilterValue(key);
			}
			setSelectedPlatform(key);
		};
		return (
			<Dropdown
				menu={{
					onClick: handleClick,
					items: platforms,
					selectedKeys: [selectedPlatform],
					id: 'platform-header',
				}}
			>
				<PlatformHeader>
					<th>{selectedPlatform === all ? '플랫폼' : selectedPlatform}</th>
					<DownOutlined />
				</PlatformHeader>
			</Dropdown>
		);
	};

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
									{header.column.id === 'name'
										? renderNameFilter(header.column, header.column.getSize())
										: header.column.id === 'platform'
											? renderPlatformFilter(header.column)
											: null}
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
								<td key={header.id} colSpan={6}>
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
