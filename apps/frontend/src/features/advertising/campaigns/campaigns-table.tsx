import React, { useState, useMemo } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	createColumnHelper,
} from '@tanstack/react-table';
import { Popconfirm, Switch } from 'antd';
import { useNavigate, useParams } from 'react-router';
import { TableStyles } from '@/app/global-styles';
import { axiosInstance } from '@/shared/api/axios';

export interface CampaignColumns {
	campaignIdx: string;
	token: string;
	campaignName: string;
	campaignType: string;
	mediaName: string;
	trackerName: string;
	campaignStatus: number;
	campaignBlock: number;
}

const columnHelper = createColumnHelper<CampaignColumns>();

const CampaignsTable = (props: { data: Array<CampaignColumns> }) => {
	const [data, setData] = useState(props.data);

	const navigate = useNavigate();

	const { id: paramId } = useParams();

	const confirmBlock = async (idx: string) => {
		updateData(idx, 'campaignBlock');
		try {
			await axiosInstance.patch(`/campaigns/${idx}/block`);
		} catch (error) {
			handleError();
		}
	};

	const confirmChange = async (idx: string) => {
		updateData(idx, 'campaignStatus');
		try {
			await axiosInstance.patch(`/campaigns/${idx}`);
		} catch (error) {
			handleError();
		}
	};

	const updateData = (idx: string, key: string) => {
		const index = data.findIndex(element => element.campaignIdx === idx);
		const updatedRow = Object.assign(data[index], {
			[key]: +!data[index][key as keyof CampaignColumns],
		});
		const updatedData = [...data];
		updatedData[index] = updatedRow;
		setData(updatedData);
	};

	const handleError = () => {
		sessionStorage.clear();
		navigate('/login');
	};

	const handleNameClick = (campaignIdx: string) => {
		navigate(`/advertising/${paramId}/events/${campaignIdx}`);
	};

	const handleRowClick = (rowValues: CampaignColumns) => {
		const { mediaName } = rowValues;
		sessionStorage.setItem('eventMediaName', mediaName);
	};

	const columns = useMemo(
		() => [
			columnHelper.accessor('campaignIdx', {}),
			columnHelper.accessor('campaignStatus', {}),
			columnHelper.accessor('campaignBlock', {}),
			columnHelper.accessor('token', {}),
			columnHelper.accessor('mediaName', { header: '매체', maxSize: 60 }),
			columnHelper.accessor('campaignType', { header: '타입', maxSize: 30 }),
			columnHelper.accessor('campaignName', {
				header: '캠페인명',
				size: 160,
				cell: info => {
					const { campaignIdx, campaignName } = info.row.original;
					return (
						<span
							id="campaign-column"
							role="button"
							tabIndex={0}
							onClick={() => handleNameClick(campaignIdx)}
							onKeyDown={() => handleNameClick(campaignIdx)}
							style={{ cursor: 'pointer' }}
						>
							{campaignName}
						</span>
					);
				},
			}),
			columnHelper.display({
				id: 'change-switch',
				header: '예약 변경',
				cell: info => {
					const { campaignIdx, campaignStatus } = info.row.original;
					return (
						<Popconfirm
							title="진행하시겠습니까?"
							onConfirm={() => confirmChange(campaignIdx)}
							okText="Yes"
							cancelText="No"
						>
							<Switch checked={!!campaignStatus} size="small" />
						</Popconfirm>
					);
				},
			}),
			columnHelper.display({
				id: 'block-switch',
				header: 'block',
				cell: info => {
					const { campaignIdx, campaignBlock } = info.row.original;
					return (
						<Popconfirm
							title="진행하시겠습니까?"
							onConfirm={() => confirmBlock(campaignIdx)}
							okText="Yes"
							cancelText="No"
						>
							<Switch checked={!!campaignBlock} size="small" />
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
		initialState: {
			columnVisibility: {
				campaignIdx: false,
				campaignStatus: false,
				token: false,
				campaignBlock: false,
			},
		},
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
					{table.getRowModel().rows.map(row => {
						const { campaignStatus } = row.original;
						return (
							<tr
								key={row.id}
								role="button"
								tabIndex={0}
								onClick={() => handleRowClick(row.original)}
								onKeyDown={() => handleRowClick(row.original)}
								className="tr"
								style={{
									backgroundColor: campaignStatus === 0 ? '#f8f8f8' : undefined,
									color: campaignStatus === 0 ? 'grey' : undefined,
								}}
							>
								{row.getVisibleCells().map(cell => (
									<td key={cell.id} className="td">
										<div className="ellipsis">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</div>
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
		</TableStyles>
	);
};

export default CampaignsTable;
