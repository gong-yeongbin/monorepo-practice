import React, { useState, useMemo } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	flexRender,
	createColumnHelper,
} from '@tanstack/react-table';
import { observer } from 'mobx-react';
import { Avatar, Pagination, Popconfirm, Switch } from 'antd';
import { useNavigate } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { TableStyles, DefaultImg } from '../../globalStyles';
import { ImageContainer, PageContainer } from './styles';
import { axiosInstance } from '../../axios';
import logo from '../../images/logo.png';

export interface IColumns {
	idx: string;
	name: string;
	platform: string;
	imageUrl: string | null;
	createdAt: string;
	updatedAt: string;
	status: number;
	campaign: number;
}

const rowsPerPage = 25;

const columnHelper = createColumnHelper<IColumns>();

const AdvertisingTable = observer((props: { data: Array<IColumns> }) => {
	const { data: dataProp } = props;
	const [data, setData] = useState(dataProp);

	const navigate = useNavigate();

	const confirmStatus = async (idx: string) => {
		updateData(idx, 'status');
		try {
			await axiosInstance.patch(`/advertising/${idx}`);
		} catch (error) {
			handleError();
		}
	};

	const updateData = (idx: string, key: string) => {
		const index = data.findIndex(element => element.idx === idx);
		const updatedElement = Object.assign(data[index], {
			[key]: +!data[index][key as keyof IColumns],
		});
		const dataCopy = [...data];
		dataCopy[index] = updatedElement;
		setData(dataCopy);
	};

	const handleError = () => {
		sessionStorage.clear();
		navigate('/login');
	};

	const handleNameClick = (idx: string) => {
		navigate(`/advertising/${idx}`);
	};

	const columns = useMemo(
		() => [
			columnHelper.accessor('idx', {}),
			columnHelper.accessor('status', {}),
			columnHelper.accessor('imageUrl', {}),
			columnHelper.accessor('platform', {}),
			columnHelper.display({
				id: 'no',
				header: 'no',
				size: 25,
				maxSize: 25,
				cell: info => info.table.getRowModel().rows.length - info.row.index,
			}),
			columnHelper.accessor('name', {
				header: '광고명',
				size: 110,
				cell: info => {
					const { idx, imageUrl, name } = info.row.original;
					return (
						<>
							<ImageContainer>
								{imageUrl || imageUrl !== '' ? (
									<Avatar
										style={{ borderRadius: '10px' }}
										size={30}
										src={`${imageUrl}?${uuidv4()}`}
									/>
								) : (
									<DefaultImg borderRadius="10px" width="30px" alt="default" src={logo} />
								)}
							</ImageContainer>
							<span
								id="name-column"
								role="button"
								tabIndex={0}
								onClick={() => handleNameClick(idx)}
								onKeyDown={() => handleNameClick(idx)}
								style={{ cursor: 'pointer' }}
							>
								{name}
							</span>
						</>
					);
				},
			}),
			columnHelper.accessor('campaign', {
				header: () => <span style={{ wordBreak: 'keep-all' }}>운영 캠페인</span>,
				size: 50,
			}),
			columnHelper.display({
				id: 'status-switch',
				header: 'ON/OFF',
				size: 40,
				cell: info => {
					const { idx, status } = info.row.original;
					return (
						<Popconfirm
							title="진행하시겠습니까?"
							onConfirm={() => confirmStatus(idx)}
							okText="Yes"
							cancelText="No"
						>
							<Switch checked={!!status} size="small" />
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
		getPaginationRowModel: getPaginationRowModel(),
		columnResizeMode: 'onChange',
		enableColumnResizing: true,
		initialState: {
			columnVisibility: { idx: false, status: false, imageUrl: false, platform: false },
			pagination: { pageIndex: 0, pageSize: rowsPerPage },
		},
	});

	return (
		<TableStyles>
			<table id="ad-table">
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
									<div className="ellipsis">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</div>
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>

			<PageContainer>
				<Pagination
					size="small"
					pageSize={rowsPerPage}
					total={data.length}
					onChange={(page, _pageSize) => table.setPageIndex(page - 1)}
				/>
			</PageContainer>
		</TableStyles>
	);
});

export default AdvertisingTable;
