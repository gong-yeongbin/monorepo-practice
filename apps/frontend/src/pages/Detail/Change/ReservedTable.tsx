import React, { useMemo } from 'react';
import { useTable, useResizeColumns, useFlexLayout, Column } from 'react-table';
import { useNavigate } from 'react-router';
import { Button, message, Popconfirm, Skeleton, Table as EmptyTable } from 'antd';
import moment from 'moment';
import { ListWrapper } from './styles';
import { TableStyles } from '../../../globalStyles';
import { axiosInstance } from '../../../axios';

export interface IColumns {
	reservationIdx: string;
	reservedAt: string;
	campaignName: string;
	mediaName: string;
	newTrackerTrackingUrl: string;
	status: boolean;
}

const ReservedTable = (props: {
	setShowUrlModal: React.Dispatch<React.SetStateAction<boolean>>;
	setURL: React.Dispatch<React.SetStateAction<string>>;
	getReserved: any;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	data: {
		reservationIdx: string;
		reservedAt: string;
		campaignName: string;
		mediaName: string;
		newTrackerTrackingUrl: string;
		status: boolean;
	}[];
}) => {
	const { setShowUrlModal, setURL, loading, setLoading, getReserved, data } = props;

	const navigate = useNavigate();

	const handleDelete = async (idx: string) => {
		try {
			setLoading(true);
			const res = await axiosInstance.delete(`/reservation/${idx}`);
			await getReserved();
			setLoading(false);
			message.success('삭제되었습니다.');
		} catch (error) {
			sessionStorage.clear();
			navigate('/login');
		}
	};

	const columns: Column<IColumns>[] = useMemo(
		() => [
			{
				accessor: 'reservationIdx',
			},
			{
				Header: 'no',
				id: 'no',
				width: 45,
				accessor: (_originalRow, rowIndex) => rowIndex + 1,
			},
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
				Header: '변경 시간',
				accessor: row => {
					return moment(row.reservedAt).format('YY-MM-DD HH:mm');
				},
				width: 70,
			},
			{
				Header: '트랙킹 URL',
				accessor: 'newTrackerTrackingUrl',
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
			{
				Header: '비고',
				accessor: 'status',
				width: 50,
				maxWidth: 50,
				Cell: (info: any) => {
					const {
						row: { values },
					} = info;
					const { reservationIdx, status } = values;
					return status === 1 ? (
						'완료'
					) : (
						<Popconfirm
							title="삭제하시겠습니까?"
							onConfirm={() => handleDelete(reservationIdx)}
							okText="Yes"
							cancelText="No"
						>
							<Button type="text" danger size="small" style={{ width: '4rem' }}>
								삭제
							</Button>
						</Popconfirm>
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
			minWidth: 45,
			width: 100,
			maxWidth: 300,
		}),
		[],
	);

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
		{
			defaultColumn,
			columns,
			data,
			initialState: { hiddenColumns: ['reservationIdx'] },
		},
		useResizeColumns,
		useFlexLayout,
	);

	return (
		<ListWrapper>
			<TableStyles height="calc(var(--vh, 1vh) * 100 - 30rem)">
				<table {...getTableProps()} id="reserved-table" className="sticky">
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
							<Skeleton active title={false} paragraph={{ width: '100%', rows: 12 }} />
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
		</ListWrapper>
	);
};

export default ReservedTable;
