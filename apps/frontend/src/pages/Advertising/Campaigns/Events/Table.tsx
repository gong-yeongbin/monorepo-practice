import React, { useMemo } from 'react';
import { useTable, useFlexLayout, Column } from 'react-table';
import { observer } from 'mobx-react';
import { CheckCircleOutlined } from '@ant-design/icons';
import { TableStyles } from '../../../../globalStyles';

export interface IColumns {
	admin: string;
	media: string;
	status: number;
	tracker: string;
}

const EventsTable = observer((props: { events: Array<IColumns> }) => {
	const { events } = props;

	const columns: Column<IColumns>[] = useMemo(
		() => [
			{
				Header: '트래커 수신 이벤트 값',
				accessor: 'tracker',
			},
			{
				Header: '어드민 적용 항목',
				accessor: 'admin',
			},
			{
				Header: '매체 전송 이벤트 값',
				accessor: 'media',
			},
			{
				Header: '매체 수신',
				accessor: 'status',
				Cell: (info: any) => {
					const {
						row: { values },
					} = info;
					const { status } = values;
					return status === 1 ? (
						<CheckCircleOutlined style={{ color: 'var(--blue)' }} />
					) : (
						<CheckCircleOutlined style={{ color: 'var(--grey)' }} />
					);
				},
			},
		],
		[],
	);

	const headerProps = (props: any, { column }: any) => getStyles(props, column.align);

	const cellProps = (props: any, { cell }: any) => getStyles(props, cell.column.align);

	const rowProps = (props: any, { row }: any) => getRowStyles(props, row.values.campaignStatus);

	const getRowStyles = (props: any, campaignStatus: number) => [
		props,
		{
			style: {
				backgroundColor: campaignStatus === 0 && '#FDFDFD',
				color: campaignStatus === 0 && 'grey',
			},
		},
	];

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
			minWidth: 60,
			width: 85,
			maxWidth: 300,
		}),
		[],
	);

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
		{
			defaultColumn,
			columns,
			data: events,
		},
		useFlexLayout,
	);

	return (
		<TableStyles>
			<table {...getTableProps()} id="campaign-event-table">
				<thead>
					{headerGroups.map(headerGroup => (
						<tr {...headerGroup.getHeaderGroupProps()} className="tr">
							{headerGroup.headers.map(column => (
								<th {...column.getHeaderProps(headerProps)} className="th">
									{column.render('Header')}
								</th>
							))}
						</tr>
					))}
				</thead>

				<tbody className="tbody" {...getTableBodyProps()}>
					{rows.map((row, i) => {
						prepareRow(row);
						return (
							<tr {...row.getRowProps(rowProps)} className="tr">
								{row.cells.map(cell => {
									return (
										<td {...cell.getCellProps(cellProps)} className="td">
											<div>{cell.render('Cell')}</div>
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
		</TableStyles>
	);
});

export default EventsTable;
