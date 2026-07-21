import React, { useMemo } from 'react';
import {
	useTable,
	useResizeColumns,
	useFlexLayout,
	Column,
	useRowSelect,
	useMountedLayoutEffect,
} from 'react-table';
import { Button, Skeleton, Table as EmptyTable } from 'antd';
import { TableStyles } from '../../../globalStyles';
import IndeterminateCheckbox from './IndeterminateCheckbox';

export interface IColumns {
	createdAt: string;
	campaignIdx: string;
	campaignName: string;
	mediaIdx: string;
	mediaName: string;
	trackerTrackingUrl: string;
}

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

	const columns: Column<IColumns>[] = useMemo(
		() => [
			{
				Header: '매체',
				accessor: 'mediaName',
				width: 70,
			},
			{
				Header: '캠페인명',
				accessor: 'campaignName',
			},
			{
				Header: '등록일',
				accessor: row => {
					return row.createdAt.slice(2, 16).replace('T', ' ');
				},
				width: 70,
			},
			{
				Header: '트랙킹 URL',
				accessor: 'trackerTrackingUrl',
				width: 55,
				maxWidth: 55,
				Cell: (info: any) => {
					const { cell } = info;
					const { value } = cell;
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
			},
		],
		[],
	);

	const headerProps = (props: any) => getStyles(props);

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
			maxWidth: 300,
		}),
		[],
	);

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, selectedFlatRows } =
		useTable(
			{
				defaultColumn,
				columns,
				data,
			},
			useResizeColumns,
			useFlexLayout,
			useRowSelect,
			hooks => {
				hooks.visibleColumns.push(columns => [
					{
						id: 'selection',
						width: 30,
						maxWidth: 30,
						Header: ({ getToggleAllRowsSelectedProps }) => (
							<IndeterminateCheckbox {...getToggleAllRowsSelectedProps({ title: undefined })} />
						),
						Cell: (props: any) => {
							const { row } = props;
							return (
								<IndeterminateCheckbox {...row.getToggleRowSelectedProps({ title: undefined })} />
							);
						},
					},
					...columns,
				]);
			},
		);

	useMountedLayoutEffect(() => {
		const selectedArray = selectedFlatRows.map(d => d.original.campaignIdx);
		setSelectedRows(selectedArray);
	}, [selectedFlatRows]);

	return (
		<TableStyles height="calc(var(--vh, 1vh) * 100 - 40.2rem)">
			<table {...getTableProps()} id="selectable-table">
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
				)}
			</table>
		</TableStyles>
	);
};

export default SelectableTable;
