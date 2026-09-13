import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
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

export const rowsPerPage = 25;

const columnHelper = createColumnHelper<AdvertiserColumns>();

// 서버 페이징: data는 현재 페이지 항목만, total은 검색 조건 전체 건수. 페이지 이동은 onPageChange로 상위에 알린다
interface AdvertisingTableProps {
	data: Array<AdvertiserColumns>;
	page: number;
	total: number;
	onPageChange: (page: number) => void;
}

const AdvertisingTable = observer((props: AdvertisingTableProps) => {
	const { data, page, total, onPageChange } = props;

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
		columnResizeMode: 'onChange',
		enableColumnResizing: true,
		initialState: {
			columnVisibility: { idx: false, status: false, imageUrl: false, platform: false },
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
					current={page}
					total={total}
					onChange={nextPage => onPageChange(nextPage)}
				/>
			</PageContainer>
		</TableStyles>
	);
});

export default AdvertisingTable;
