import React, { useMemo } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	flexRender,
	createColumnHelper,
} from '@tanstack/react-table';
import { observer } from 'mobx-react';
import { Avatar, Pagination } from 'antd';
import { useNavigate } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { TableStyles, DefaultImg } from '@/app/global-styles';
import { ImageContainer, PageContainer } from '@/features/advertising/advertising.styles';
import logo from '@/images/logo.png';

export interface AdvertiserColumns {
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

const columnHelper = createColumnHelper<AdvertiserColumns>();

const AdvertisingTable = observer((props: { data: Array<AdvertiserColumns> }) => {
	const { data } = props;

	const navigate = useNavigate();

	const handleNameClick = (idx: string) => {
		navigate(`/advertising/${idx}`);
	};

	const columns = useMemo(
		() => [
			columnHelper.accessor('idx', {}),
			columnHelper.accessor('status', {}),
			columnHelper.accessor('imageUrl', {}),
			columnHelper.accessor('platform', {}),
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
