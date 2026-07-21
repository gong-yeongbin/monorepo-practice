import React, { useMemo } from 'react';
import { Column, useFlexLayout, useResizeColumns, useTable } from 'react-table';
import { observer } from 'mobx-react';
import { TableStyles } from '../../globalStyles';
import { getTotal } from '../../getTotal';

export interface IColumns {
	count: string;
	eventName: string;
}

const UnregisteredTable = observer((props: { data: Array<IColumns> }) => {
	const { data } = props;

	const columns: Column<IColumns>[] = useMemo(
		() => [
			{
				Header: 'event name',
				accessor: 'eventName',
				Footer: () => {
					return <div className="total">합계</div>;
				},
			},
			{
				Header: 'count',
				accessor: data => data.count.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
				Footer: info => getTotal(info),
			},
		],
		[],
	);

	const headerProps = (props: any, { column }: any) => getStyles(props, column.frozen);

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
			width: 100,
			maxWidth: 400,
			height: 50,
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
		<TableStyles>
			<table {...getTableProps()} id="unregistered-table">
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

				<tfoot>
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
	);
});
export default UnregisteredTable;
