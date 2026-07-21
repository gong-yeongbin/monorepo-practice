import React, { useMemo } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	createColumnHelper,
} from '@tanstack/react-table';
import { observer } from 'mobx-react';
import { TableStyles } from '@/app/global-styles';
import { getTotal } from '@/shared/lib/get-total';

export interface UnregisteredModalColumns {
	count: string;
	eventName: string;
}

const columnHelper = createColumnHelper<UnregisteredModalColumns>();

const UnregisteredTable = observer((props: { data: Array<UnregisteredModalColumns> }) => {
	const { data } = props;

	const columns = useMemo(
		() => [
			columnHelper.accessor('eventName', {
				header: 'event name',
				footer: () => <div className="total">합계</div>,
			}),
			columnHelper.accessor(row => row.count.replace(/\B(?=(\d{3})+(?!\d))/g, ','), {
				id: 'count',
				header: 'count',
				footer: info => getTotal(info),
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
		<TableStyles>
			<table id="unregistered-table">
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

				<tfoot>
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
});
export default UnregisteredTable;
