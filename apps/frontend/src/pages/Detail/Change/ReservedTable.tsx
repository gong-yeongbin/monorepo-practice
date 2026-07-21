import React, { useMemo } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	createColumnHelper,
} from '@tanstack/react-table';
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

const columnHelper = createColumnHelper<IColumns>();

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

	const columns = useMemo(
		() => [
			columnHelper.accessor('reservationIdx', {}),
			columnHelper.display({
				id: 'no',
				header: 'no',
				size: 45,
				cell: info => info.row.index + 1,
			}),
			columnHelper.accessor('mediaName', { header: '매체', size: 70 }),
			columnHelper.accessor('campaignName', { header: '캠페인명' }),
			columnHelper.accessor(row => moment(row.reservedAt).format('YY-MM-DD HH:mm'), {
				id: 'reservedAt',
				header: '변경 시간',
				size: 70,
			}),
			columnHelper.accessor('newTrackerTrackingUrl', {
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
			columnHelper.accessor('status', {
				header: '비고',
				size: 50,
				maxSize: 50,
				cell: info => {
					const { reservationIdx, status } = info.row.original;
					return status ? (
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
		initialState: { columnVisibility: { reservationIdx: false } },
	});

	return (
		<ListWrapper>
			<TableStyles height="calc(var(--vh, 1vh) * 100 - 30rem)">
				<table id="reserved-table" className="sticky">
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
		</ListWrapper>
	);
};

export default ReservedTable;
