import React, { useMemo, useState, useEffect } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	createColumnHelper,
	RowSelectionState,
} from '@tanstack/react-table';
import { Button, Skeleton, Table as EmptyTable } from 'antd';
import { TableStyles } from '@/app/globalStyles';
import IndeterminateCheckbox from '@/features/detail/Change/IndeterminateCheckbox';

export interface IColumns {
	createdAt: string;
	campaignIdx: string;
	campaignName: string;
	mediaIdx: string;
	mediaName: string;
	trackerTrackingUrl: string;
}

const columnHelper = createColumnHelper<IColumns>();

const SelectableTable = (props: {
	setShowUrlModal: React.Dispatch<React.SetStateAction<boolean>>;
	setURL: React.Dispatch<React.SetStateAction<string>>;
	setSelectedRows: any;
	loading: boolean;
	data: {
		createdAt: string;
		campaignIdx: string;
		campaignName: string;
		mediaIdx: string;
		mediaName: string;
		trackerTrackingUrl: string;
	}[];
}) => {
	const { setShowUrlModal, setURL, setSelectedRows, loading, data } = props;

	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const columns = useMemo(
		() => [
			columnHelper.display({
				id: 'selection',
				size: 30,
				maxSize: 30,
				header: ({ table }) => (
					<IndeterminateCheckbox
						checked={table.getIsAllRowsSelected()}
						indeterminate={table.getIsSomeRowsSelected()}
						onChange={table.getToggleAllRowsSelectedHandler()}
					/>
				),
				cell: ({ row }) => (
					<IndeterminateCheckbox
						checked={row.getIsSelected()}
						indeterminate={row.getIsSomeSelected()}
						onChange={row.getToggleSelectedHandler()}
					/>
				),
			}),
			columnHelper.accessor('mediaName', { header: '매체', size: 70 }),
			columnHelper.accessor('campaignName', { header: '캠페인명' }),
			columnHelper.accessor(row => row.createdAt.slice(2, 16).replace('T', ' '), {
				id: 'createdAt',
				header: '등록일',
				size: 70,
			}),
			columnHelper.accessor('trackerTrackingUrl', {
				header: '트랙킹 URL',
				size: 55,
				maxSize: 55,
				cell: info => {
					const value = info.getValue();
					return (
						<Button
							type="link"
							size="small"
							style={{ width: '4rem' }}
							onClick={() => {
								setURL(value);
								setShowUrlModal(true);
							}}
						>
							보기
						</Button>
					);
				},
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
		enableRowSelection: true,
		state: { rowSelection },
		onRowSelectionChange: setRowSelection,
	});

	useEffect(() => {
		const selectedArray = table.getSelectedRowModel().flatRows.map(d => d.original.campaignIdx);
		setSelectedRows(selectedArray);
	}, [rowSelection]);

	return (
		<TableStyles height="calc(var(--vh, 1vh) * 100 - 40.2rem)">
			<table id="selectable-table">
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

				{loading ? (
					<div style={{ padding: '1rem' }}>
						<Skeleton active title={false} paragraph={{ width: '100%', rows: 6 }} />
					</div>
				) : data.length === 0 ? (
					<EmptyTable
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							height: '100%',
						}}
					/>
				) : (
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
				)}
			</table>
		</TableStyles>
	);
};

export default SelectableTable;
