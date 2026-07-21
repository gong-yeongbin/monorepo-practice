import React, { useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	createColumnHelper,
	CellContext,
} from '@tanstack/react-table';
import { Input, Select, Popconfirm } from 'antd';
import { CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { TableStyles } from '@/app/globalStyles';
import { BiggerOnHover } from '@/features/advertising/styles';
import { IColumns } from '@/features/advertising/Campaigns/Events/Table';

// 편집 테이블은 셀에서 updateData를 호출해야 하므로 table.options.meta로 전달한다.
interface EditTableMeta {
	updateData: (rowIndex: number, columnID: string, value: any) => void;
}

const columnHelper = createColumnHelper<IColumns>();

const EditTable = observer((props: { events: Array<IColumns>; setNewEvents: any }) => {
	const { events, setNewEvents } = props;

	const [data, setData] = useState<IColumns[]>([
		...events,
		{
			tracker: '',
			admin: '선택',
			media: '',
			status: 1,
		},
	]);

	const { Option } = Select;

	useEffect(() => {
		const lastData = data.at(-1);
		if (lastData && lastData.media.length > 0) {
			addRow();
		}
	}, [data]);

	useEffect(() => {
		const lastDataFiltered = data.filter(
			(item: any, itemIndex: number) => itemIndex + 1 !== data.length,
		);
		const checkIfAdminSelected = lastDataFiltered.filter((item: any) => item.admin !== '선택');
		setNewEvents(checkIfAdminSelected);
	}, [data]);

	const addRow = () => {
		setData((old: any) => [
			...old,
			{
				tracker: '',
				admin: '선택',
				media: '',
				status: 1,
			},
		]);
	};

	const updateData = (rowIndex: number, columnID: string, value: any) => {
		setData(oldData =>
			oldData.map((row, index) => {
				if (index === rowIndex) {
					return {
						...oldData[rowIndex],
						[columnID]: value,
					};
				}

				return row;
			}),
		);
	};

	const deleteData = (rowIndex: number) => {
		setData(oldData => oldData.filter((row, index) => index !== rowIndex));
	};

	const TableTrackerInput = (info: CellContext<IColumns, string>) => {
		const onChange = (e: { target: { value: any } }) => {
			(info.table.options.meta as EditTableMeta).updateData(
				info.row.index,
				info.column.id,
				e.target.value,
			);
		};
		return (
			<Input size="small" value={info.getValue()} onChange={onChange} style={{ width: '15rem' }} />
		);
	};

	const TableMediaInput = (info: CellContext<IColumns, string>) => {
		const onChange = (e: { target: { value: any } }) => {
			(info.table.options.meta as EditTableMeta).updateData(
				info.row.index,
				info.column.id,
				e.target.value,
			);
		};
		return (
			<Input size="small" value={info.getValue()} onChange={onChange} style={{ width: '15rem' }} />
		);
	};

	const TableSelect = (info: CellContext<IColumns, string>) => {
		const onChange = (value: any) => {
			(info.table.options.meta as EditTableMeta).updateData(info.row.index, info.column.id, value);
		};
		const options = [
			'install',
			'registration',
			'retention',
			'purchase',
			'etc1',
			'etc2',
			'etc3',
			'etc4',
			'etc5',
		];
		const children = [];
		for (let i = 0; i < options.length; i++) {
			children.push(
				<Option key={i} value={options[i]}>
					{options[i]}
				</Option>,
			);
		}
		return (
			<Select
				defaultValue={info.getValue()}
				onChange={onChange}
				size="small"
				style={{ width: '10rem' }}
			>
				{children}
			</Select>
		);
	};

	const TableIcon = (info: CellContext<IColumns, number>) => {
		const onChange = () => {
			const newStatusData = info.getValue() ? 0 : 1;
			(info.table.options.meta as EditTableMeta).updateData(
				info.row.index,
				info.column.id,
				newStatusData,
			);
		};
		return (
			<BiggerOnHover onClick={onChange}>
				{info.getValue() === 1 ? (
					<CheckCircleOutlined style={{ color: 'var(--blue)' }} />
				) : (
					<CheckCircleOutlined style={{ color: 'var(--grey)' }} />
				)}
			</BiggerOnHover>
		);
	};

	const TableDeleteButton = (info: CellContext<IColumns, unknown>) => {
		const onConfirm = () => {
			deleteData(info.row.index);
		};
		return (
			<Popconfirm title="삭제합니다." onConfirm={onConfirm} okText="Yes" cancelText="No">
				<BiggerOnHover>
					<MinusCircleOutlined />
				</BiggerOnHover>
			</Popconfirm>
		);
	};

	const columns = useMemo(
		() => [
			columnHelper.display({
				id: 'no',
				header: 'no',
				cell: info => info.row.index,
			}),
			columnHelper.accessor('tracker', {
				header: '트래커 수신 이벤트 값',
				cell: TableTrackerInput,
			}),
			columnHelper.accessor('admin', {
				header: '어드민 적용 항목',
				cell: TableSelect,
			}),
			columnHelper.accessor('media', {
				header: '매체 전송 이벤트 값',
				cell: TableMediaInput,
			}),
			columnHelper.accessor('status', {
				header: '매체 수신',
				size: 45,
				cell: TableIcon,
			}),
			columnHelper.display({
				id: 'delete',
				header: '삭제',
				size: 45,
				cell: TableDeleteButton,
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
		initialState: { columnVisibility: { no: false } },
		meta: { updateData } as EditTableMeta,
	});

	return (
		<TableStyles>
			<table id="campaign-list-table">
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

export default EditTable;
