import React, { useMemo } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	createColumnHelper,
} from '@tanstack/react-table';
import { observer } from 'mobx-react';
import { CheckCircleOutlined } from '@ant-design/icons';
import { TableStyles } from '@/app/globalStyles';

export interface IColumns {
	admin: string;
	media: string;
	status: number;
	tracker: string;
}

const columnHelper = createColumnHelper<IColumns>();

const EventsTable = observer((props: { events: Array<IColumns> }) => {
	const { events } = props;

	const columns = useMemo(
		() => [
			columnHelper.accessor('tracker', { header: '트래커 수신 이벤트 값' }),
			columnHelper.accessor('admin', { header: '어드민 적용 항목' }),
			columnHelper.accessor('media', { header: '매체 전송 이벤트 값' }),
			columnHelper.accessor('status', {
				header: '매체 수신',
				cell: info =>
					info.row.original.status === 1 ? (
						<CheckCircleOutlined style={{ color: 'var(--blue)' }} />
					) : (
						<CheckCircleOutlined style={{ color: 'var(--grey)' }} />
					),
			}),
		],
		[],
	);

	const table = useReactTable({
		data: events,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<TableStyles>
			<table id="campaign-event-table">
				<thead>
					{table.getHeaderGroups().map(headerGroup => (
						<tr key={headerGroup.id} className="tr">
							{headerGroup.headers.map(header => (
								<th key={header.id} className="th">
									{flexRender(header.column.columnDef.header, header.getContext())}
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
									<div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</TableStyles>
	);
});

export default EventsTable;
