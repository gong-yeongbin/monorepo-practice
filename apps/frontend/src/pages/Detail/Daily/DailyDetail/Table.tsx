import React, { useState, useMemo } from 'react';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import { useTable, useResizeColumns, useFlexLayout, useSortBy, Column } from 'react-table';
import { TableStyles } from '../../../../globalStyles';
import { getCell } from '../../../../getCell';
import InstallModal from '../../../../components/Modals/InstallModal';
import EventModal from '../../../../components/Modals/EventModal';

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

	const handleRowClick = (rowValues: any) => {
		const { viewCode } = rowValues;
		sessionStorage.setItem('viewCode', viewCode);
	};

	const columns: Column<IColumns>[] = useMemo(
		() => [
			{
				Header: 'no',
				id: 'no',
				width: 40,
				accessor: (_originalRow, rowIndex) => rowIndex + 1,
				disableSortBy: true,
			},
			{
				Header: 'view code',
				accessor: 'viewCode',
				minWidth: 250,
				disableSortBy: true,
			},
			{
				Header: 'pub id',
				accessor: 'pubId',
				minWidth: 70,
				disableSortBy: true,
			},
			{
				Header: 'sub id',
				accessor: 'subId',
				minWidth: 70,
				disableSortBy: true,
			},
			{
				Header: 'click',
				accessor: 'click',
				minWidth: 80,
				Cell: info => getCell.normal(info),
			},
			{
				Header: 'install',
				accessor: 'install',
				minWidth: 90,
				Cell: info => getCell.linkedInstall(info, setInstallVisible),
			},
			{
				Header: 'cvr',
				accessor: 'cvr',
				width: 75,
				Cell: info => getCell.cvr(info),
				disableSortBy: true,
			},
			{
				Header: 'retention',
				accessor: 'retention',
				minWidth: 105,
				Cell: info => getCell.event(info, setEventVisible),
			},
			{
				Header: 'purchase',
				accessor: 'purchase',
				minWidth: 100,
				Cell: info => getCell.event(info, setEventVisible),
			},
			{
				Header: 'revenue',
				accessor: 'revenue',
				minWidth: 95,
				Cell: info => getCell.normal(info),
			},
			{
				Header: 'registration',
				accessor: 'registration',
				minWidth: 125,
				Cell: info => getCell.event(info, setEventVisible),
			},
			{
				Header: 'etc1',
				accessor: 'etc1',
				Cell: info => getCell.event(info, setEventVisible),
			},
			{
				Header: 'etc2',
				accessor: 'etc2',
				Cell: info => getCell.event(info, setEventVisible),
			},
			{
				Header: 'etc3',
				accessor: 'etc3',
				Cell: info => getCell.event(info, setEventVisible),
			},
			{
				Header: 'etc4',
				accessor: 'etc4',
				Cell: info => getCell.event(info, setEventVisible),
			},
			{
				Header: 'etc5',
				accessor: 'etc5',
				Cell: info => getCell.event(info, setEventVisible),
			},
		],
		[],
	);

	const cellProps = (props: any, { cell }: any) => getStyles(props, cell.column.align);

	const getStyles = (props: any, align = 'center') => [
		props,
		{
			style: {
				display: 'flex',
				justifyContent: align === 'left' ? 'flex-start' : 'center',
				alignItems: 'center',
			},
		},
	];

	const defaultColumn = useMemo(
		() => ({
			width: 55,
			maxWidth: 400,
		}),
		[],
	);

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
		{
			defaultColumn,
			columns,
			data,
		},
		useResizeColumns,
		useFlexLayout,
		useSortBy,
	);

	return (
		<>
			{installVisible && (
				<InstallModal installVisible={installVisible} setInstallVisible={setInstallVisible} />
			)}
			{eventVisible && <EventModal eventVisible={eventVisible} setEventVisible={setEventVisible} />}

			<TableStyles height="calc(var(--vh, 1vh) * 100 - 15rem)">
				<table {...getTableProps()} id="daily-detail-table" className="sticky">
					<thead>
						{headerGroups.map(headerGroup => (
							<tr {...headerGroup.getHeaderGroupProps()} className="tr">
								{headerGroup.headers.map(column => (
									<th {...column.getHeaderProps()} className="th">
										{column.render('Header')}
										<div
											{...column.getResizerProps()}
											className={`resizer ${column.isResizing ? 'isResizing' : ''}`}
										/>
										<span
											style={{
												verticalAlign: 'middle',
												marginLeft: '4px',
											}}
										>
											{column.canSort && column.Header?.toString() === orderType ? (
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
												column.canSort && (
													<FontAwesomeIcon
														style={{ cursor: 'pointer' }}
														icon={faSort}
														onClick={() => setOrderType(column.Header?.toString() || 'install')}
													/>
												)
											)}
										</span>
									</th>
								))}
							</tr>
						))}
					</thead>

					<tbody {...getTableBodyProps()}>
						{rows.map((row, i) => {
							prepareRow(row);
							return (
								<tr
									role="button"
									tabIndex={0}
									onClick={() => handleRowClick(row.values)}
									onKeyDown={() => handleRowClick(row.values)}
									{...row.getRowProps()}
									className="tr"
								>
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
				</table>
			</TableStyles>
		</>
	);
};

export default DailyDetailTable;
