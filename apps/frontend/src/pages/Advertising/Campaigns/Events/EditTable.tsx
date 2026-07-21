import React, { useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import { useTable, useResizeColumns, useFlexLayout, Column } from 'react-table';
import { Input, Select, Popconfirm } from 'antd';
import { CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { TableStyles } from '../../../../globalStyles';
import { BiggerOnHover } from '../../styles';
import { IColumns } from './Table';

const EditTable = observer((props: { events: Array<IColumns>; setNewEvents: any }) => {
	const { events, setNewEvents } = props;

	const [data, setData] = useState([
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

	const updateData = (rowIndex: number, columnID: any, value: any) => {
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

	const TableTrackerInput = (props: { column: any; row: any; cell: any; updateData: any }) => {
		const { column, row, cell, updateData } = props;
		const onChange = (e: { target: { value: any } }) => {
			updateData(row.index, column.id, e.target.value);
		};
		return <Input size="small" value={cell.value} onChange={onChange} style={{ width: '15rem' }} />;
	};

	const TableMediaInput = (props: { column: any; row: any; cell: any; updateData: any }) => {
		const { column, row, cell, updateData } = props;
		const onChange = (e: { target: { value: any } }) => {
			updateData(row.index, column.id, e.target.value);
		};
		return <Input size="small" value={cell.value} onChange={onChange} style={{ width: '15rem' }} />;
	};

	const TableSelect = (props: { column: any; row: any; cell: any; updateData: any }) => {
		const { column, row, cell, updateData } = props;
		const onChange = (value: any, option: any) => {
			updateData(row.index, column.id, value);
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
			<Select defaultValue={cell.value} onChange={onChange} size="small" style={{ width: '10rem' }}>
				{children}
			</Select>
		);
	};

	const TableIcon = (props: { column: any; row: any; cell: any; updateData: any }) => {
		const { column, row, cell, updateData } = props;
		const onChange = () => {
			const newStatusData = cell.value ? 0 : 1;
			updateData(row.index, column.id, newStatusData);
		};
		return (
			<BiggerOnHover onClick={onChange}>
				{cell.value === 1 ? (
					<CheckCircleOutlined style={{ color: 'var(--blue)' }} />
				) : (
					<CheckCircleOutlined style={{ color: 'var(--grey)' }} />
				)}
			</BiggerOnHover>
		);
	};

	const TableDeleteButton = (props: { row: any }) => {
		const { row } = props;
		const onConfirm = () => {
			deleteData(row.index);
		};
		return (
			<Popconfirm title="삭제합니다." onConfirm={onConfirm} okText="Yes" cancelText="No">
				<BiggerOnHover>
					<MinusCircleOutlined />
				</BiggerOnHover>
			</Popconfirm>
		);
	};

	const columns: Column<IColumns>[] = useMemo(
		() => [
			{
				Header: 'no',
				id: 'no',
				accessor: (_originalRow, rowIndex) => rowIndex,
			},
			{
				Header: '트래커 수신 이벤트 값',
				accessor: 'tracker',
				Cell: TableTrackerInput,
			},
			{
				Header: '어드민 적용 항목',
				accessor: 'admin',
				Cell: TableSelect,
			},
			{
				Header: '매체 전송 이벤트 값',
				accessor: 'media',
				Cell: TableMediaInput,
			},
			{
				Header: '매체 수신',
				accessor: 'status',
				width: 45,
				Cell: TableIcon,
			},
			{
				Header: '삭제',
				id: 'delete',
				width: 45,
				Cell: TableDeleteButton,
			},
		] as Column<IColumns>[],
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
			minWidth: 70,
			width: 200,
		}),
		[],
	);

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
		{
			defaultColumn,
			columns,
			data,
			initialState: { hiddenColumns: ['no'] },
			updateData,
		},
		useResizeColumns,
		useFlexLayout,
	);

	return (
		<TableStyles>
			<table {...getTableProps()} id="campaign-list-table">
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

export default EditTable;
