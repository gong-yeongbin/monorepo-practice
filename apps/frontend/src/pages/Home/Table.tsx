import React, { useMemo, useState, ChangeEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	useTable,
	useResizeColumns,
	useFlexLayout,
	Column,
	useSortBy,
	useFilters,
} from 'react-table';
import { Dropdown, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { getCell } from '../../getCell';
import { getTotal } from '../../getTotal';
import { TableStyles } from '../../globalStyles';
import { NameSearchBar, PlatformHeader } from './Dashboard.style';

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

const DashboardTable = (props: { data: Array<IColumns> }) => {
	const { data } = props;

	const [dataWithName] = useState(data.filter(item => item.name !== null));
	const [selectedPlatform, setSelectedPlatform] = useState(all);

	const navigate = useNavigate();

	const handleNameClick = async (rowValues: any) => {
		navigate(`/${rowValues.idx}`);
	};

	const columns: Column<IColumns>[] = useMemo(
		() => [
			{
				accessor: 'idx',
			},
			{
				Header: '광고앱',
				accessor: 'name',
				width: 190,
				minWidth: 90,
				align: 'left',
				frozen: 'true',
				Cell: (data: any) => {
					const {
						row: { values },
						value,
					} = data;
					return (
						<span
							role="button"
							tabIndex={0}
							onClick={() => handleNameClick(values)}
							onKeyDown={() => handleNameClick(values)}
							style={{ cursor: 'pointer' }}
						>
							{value}
						</span>
					);
				},
				Footer: () => {
					return <div className="total frozen">합계</div>;
				},
				Filter: info => {
					const {
						column: { filterValue, width, setFilter },
					} = info;
					const handleClick = (e: ChangeEvent<HTMLInputElement>) => {
						const {
							target: { value },
						} = e;
						setFilter(value || undefined);
					};
					const handleEscPress = (e: KeyboardEvent) => {
						if (e.code === 'Escape') {
							setFilter(undefined);
						}
					};
					return (
						width &&
						width > 100 && (
							<NameSearchBar
								value={filterValue || ''}
								onChange={handleClick}
								onKeyDown={handleEscPress}
								prefix={<SearchOutlined />}
								size="small"
								allowClear
							/>
						)
					);
				},
			},
			{
				accessor: 'platform',
				width: 60,
				minWidth: 50,
				Filter: info => {
					const {
						column: { setFilter },
					} = info;
					const handleClick = (menuEvent: { key: string }) => {
						const { key } = menuEvent;
						if (key === all) {
							setFilter(undefined);
						} else {
							setFilter(key);
						}
						setSelectedPlatform(key);
					};
					return (
						<Dropdown
							overlay={
								<Menu
									onClick={handleClick}
									items={platforms}
									selectedKeys={[selectedPlatform]}
									id="platform-header"
								/>
							}
						>
							<PlatformHeader>
								<th>{selectedPlatform === all ? '플랫폼' : selectedPlatform}</th>
								<DownOutlined />
							</PlatformHeader>
						</Dropdown>
					);
				},
			},
			{
				Header: 'click',
				width: 140,
				accessor: 'click',
				Cell: info => getCell.normal(info),
				Footer: info => getTotal(info),
			},
			{
				Header: 'install',
				accessor: 'install',
				Cell: info => getCell.normal(info),
				Footer: info => getTotal(info),
			},
			{
				Header: 'retention',
				minWidth: 80,
				accessor: data => data.retention.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
				Footer: info => getTotal(info),
			},
			{
				Header: 'purchase',
				minWidth: 80,
				accessor: data => data.purchase.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
				Footer: info => getTotal(info),
			},
			{
				Header: 'revenue',
				width: 140,
				minWidth: 80,
				accessor: data => data.revenue.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
				Footer: info => getTotal(info),
			},
			{
				Header: 'registration',
				minWidth: 105,
				accessor: data => data.registration.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
				Footer: info => getTotal(info),
			},
			{
				Header: 'etc1',
				accessor: 'etc1',
				width: 80,
				minWidth: 50,
				Footer: info => getTotal(info),
			},
			{
				Header: 'etc2',
				accessor: 'etc2',
				width: 55,
				Footer: info => getTotal(info),
			},
			{
				Header: 'etc3',
				accessor: 'etc3',
				width: 55,
				Footer: info => getTotal(info),
			},
			{
				Header: 'etc4',
				accessor: 'etc4',
				width: 55,
				Footer: info => getTotal(info),
			},
			{
				Header: 'etc5',
				accessor: 'etc5',
				width: 55,
				Footer: info => getTotal(info),
			},
		],
		[selectedPlatform],
	);

	const headerProps = (props: any, { column }: any) => getStyles(props, column.align);

	const cellProps = (props: any, { cell }: any) =>
		getStyles(props, cell.column.align, cell.column.frozen);

	const getStyles = (props: any, align = 'center', frozen = 'false') => [
		props,
		{
			style: {
				justifyContent: align === 'left' ? 'flex-start' : 'center',
				alignItems: 'center',
				display: 'flex',
				wordBreak: 'keep-all',
			},
		},
	];

	const defaultColumn = useMemo(
		() => ({
			minWidth: 55,
			width: 110,
			maxWidth: 400,
		}),
		[],
	);

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
		{
			defaultColumn,
			columns,
			data: dataWithName,
			initialState: {
				hiddenColumns: ['idx'],
				sortBy: [{ id: 'platform' }, { id: 'name' }],
			},
		},
		useResizeColumns,
		useFlexLayout,
		useFilters,
		useSortBy,
	);

	const footerGroups = headerGroups.slice().reverse();

	return (
		<TableStyles height="calc(var(--vh, 1vh) * 100 - 20rem)">
			<table {...getTableProps()} id="dashboard-table" className="sticky">
				<thead>
					{headerGroups.map(headerGroup => (
						<tr {...headerGroup.getHeaderGroupProps()} className="tr">
							{headerGroup.headers.map(column => (
								<th {...column.getHeaderProps(headerProps)} className="th">
									{column.render('Header')}
									<div
										{...column.getResizerProps()}
										className={`resizer ${column.isResizing ? 'isResizing' : ''}`}
									/>
									{column.id === 'name' || column.id === 'platform'
										? column.render('Filter')
										: null}
								</th>
							))}
						</tr>
					))}
				</thead>

				<tbody {...getTableBodyProps()}>
					{rows.map(row => {
						prepareRow(row);
						return (
							<tr {...row.getRowProps()} className="tr">
								{row.cells.map(cell => {
									return (
										<td {...cell.getCellProps(cellProps)} className="td">
											<div className="ellipsis">{cell.render('Cell')}</div>
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>

				<tfoot className="sticky">
					{footerGroups.map(group => (
						<tr {...group.getFooterGroupProps()}>
							{group.headers.map(column => (
								<td colSpan={6} {...column.getFooterProps()}>
									{column.render('Footer')}
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
