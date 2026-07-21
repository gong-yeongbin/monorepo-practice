import React, { useState, useMemo } from 'react';
import { useTable, useResizeColumns, useFlexLayout, Column } from 'react-table';
import { useNavigate, useParams } from 'react-router';
import { Button, Table } from 'antd';
import moment from 'moment';
import 'moment/locale/ko';
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

	const handleRowClick = (rowValues: any) => {
		const { date } = rowValues;
		sessionStorage.setItem('dailyDate', `20${date.slice(0, -3)}`);
		sessionStorage.setItem('dailyDetailStartDate', `20${date.slice(0, -3)}`);
		sessionStorage.setItem('dailyDetailEndDate', `20${date.slice(0, -3)}`);
	};

	const columns: Column<IColumns>[] = useMemo(
		() => [
			{
				Header: 'date',
				accessor: row => {
					return moment(row.createdAt).format('YY-MM-DD(dd)');
				},
				width: 100,
				minWidth: 45,
				Footer: () => {
					return <div className="total">합계</div>;
				},
			},
			{
				Header: 'click',
				accessor: 'click',
				width: 100,
				Cell: info => getCell.normal(info),
				Footer: info => getTotal(info),
			},
			{
				Header: 'install',
				accessor: 'install',
				Cell: info => getCell.linkedInstall(info, setInstallVisible),
				Footer: info => getTotal(info),
			},
			{
				Header: 'cvr',
				accessor: 'cvr',
				width: 75,
				Cell: info => getCell.cvr(info),
				Footer: info => getTotal(info),
			},
			{
				Header: 'retention',
				accessor: 'retention',
				minWidth: 80,
				Cell: info => getCell.event(info, setEventVisible),
				Footer: info => getTotal(info),
			},
			{
				Header: 'purchase',
				minWidth: 70,
				accessor: 'purchase',
				Cell: info => getCell.event(info, setEventVisible),
				Footer: info => getTotal(info),
			},
			{
				Header: 'revenue',
				width: 95,
				minWidth: 65,
				accessor: 'revenue',
				Cell: info => getCell.normal(info),
				Footer: info => getTotal(info),
			},
			{
				Header: 'registration',
				width: 105,
				minWidth: 100,
				accessor: 'registration',
				Cell: info => getCell.event(info, setEventVisible),
				Footer: info => getTotal(info),
			},
			{
				Header: 'etc1',
				accessor: 'etc1',
				width: 50,
				minWidth: 40,
				Cell: info => getCell.event(info, setEventVisible),
				Footer: info => getTotal(info),
			},
			{
				Header: 'etc2',
				accessor: 'etc2',
				width: 50,
				minWidth: 40,
				Cell: info => getCell.event(info, setEventVisible),
				Footer: info => getTotal(info),
			},
			{
				Header: 'etc3',
				accessor: 'etc3',
				width: 55,
				minWidth: 40,
				Cell: info => getCell.event(info, setEventVisible),
				Footer: info => getTotal(info),
			},
			{
				Header: 'etc4',
				accessor: 'etc4',
				width: 55,
				minWidth: 40,
				Cell: info => getCell.event(info, setEventVisible),
				Footer: info => getTotal(info),
			},
			{
				Header: 'etc5',
				accessor: 'etc5',
				width: 55,
				minWidth: 40,
				Cell: info => getCell.event(info, setEventVisible),
				Footer: info => getTotal(info),
			},
			{
				Header: () => (
					<span style={{ fontSize: '0.5rem', wordBreak: 'keep-all' }}>미등록 이벤트</span>
				),
				accessor: 'unregistered',
				width: 45,
				minWidth: 45,
				Cell: info => getCell.unregistered(info, setUnregisteredVisible),
				Footer: info => getTotal(info),
			},
			{
				Header: '일별상세',
				width: 70,
				minWidth: 70,
				Cell: () => {
					return (
						<Button
							type="link"
							size="small"
							style={{ width: '4rem', color: 'var(--blue)' }}
							onClick={handleDetailBtnClick}
						>
							조회
						</Button>
					);
				},
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
			minWidth: 55,
			width: 85,
			maxWidth: 400,
		}),
		[],
	);

	const { getTableProps, getTableBodyProps, headerGroups, footerGroups, rows, prepareRow } =
		useTable(
			{
				defaultColumn,
				columns,
				data,
			},
			useResizeColumns,
			useFlexLayout,
		);

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
					<table {...getTableProps()} id="daily-table" className="sticky">
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
										</th>
									))}
								</tr>
							))}
						</thead>

						<tbody className="tbody" {...getTableBodyProps()}>
							{rows.map((row, i) => {
								prepareRow(row);
								return (
									<tr
										role="button"
										tabIndex={0}
										{...row.getRowProps()}
										onClick={() => handleRowClick(row.values)}
										onKeyDown={() => handleRowClick(row.values)}
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

						<tfoot className="sticky">
							{footerGroups.map(group => (
								<tr {...group.getFooterGroupProps()}>
									{group.headers.map(column => (
										<td {...column.getFooterProps()}>{column.render('Footer')}</td>
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
