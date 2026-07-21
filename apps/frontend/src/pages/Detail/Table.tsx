import React, { useState, useMemo } from 'react';
import { useTable, useResizeColumns, useFlexLayout, Column } from 'react-table';
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

	const handleRowClick = (rowValues: any) => {
		const { mediaName, token } = rowValues;
		sessionStorage.setItem('mediaName', mediaName);
		sessionStorage.setItem('detailToken', token);
	};

	const columns: Column<IColumns>[] = useMemo(
		() => [
			{
				accessor: 'token',
			},
			{
				Header: 'campaign',
				accessor: 'campaignName',
				width: 160,
				minWidth: 80,
				align: 'left',
				Cell: (info: any) => {
					const {
						row: { values },
					} = info;
					const { campaignName } = values;
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
				Footer: () => {
					return <div className="total frozen">합계</div>;
				},
			},
			{
				Header: 'media',
				accessor: 'mediaName',
				width: 90,
			},
			{
				Header: 'type',
				accessor: 'type',
				width: 45,
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
				minWidth: 80,
				accessor: 'retention',
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
				Header: '상태',
				accessor: 'status',
				width: 55,
				Cell: info => getCell.status(info),
			},
			{
				Header: '등록일',
				accessor: 'createdAt',
				width: 80,
				Cell: info => getCell.createdAt(info),
			},
		] as Column<IColumns>[],
		[],
	);

	const headerProps = (props: any, { column }: any) => getStyles(props, column.frozen);

	const cellProps = (props: any, { cell }: any) =>
		getStyles(props, cell.column.align, cell.column.frozen);

	const getStyles = (props: any, align = 'center', frozen = 'false') => [
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
				data: detail,
				initialState: { hiddenColumns: ['token'] },
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

			<TableStyles height="calc(var(--vh, 1vh) * 100 - 15rem)">
				<table {...getTableProps()} id="detail-table" className="sticky">
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
		</>
	);
});

export default DetailTable;
