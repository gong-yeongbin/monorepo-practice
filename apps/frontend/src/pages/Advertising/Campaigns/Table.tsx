import React, { useState, useMemo } from 'react';
import { useTable, useResizeColumns, useFlexLayout, Column } from 'react-table';
import { observer } from 'mobx-react';
import { Popconfirm, Switch } from 'antd';
import { useNavigate, useParams } from 'react-router';
import { TableStyles } from '../../../globalStyles';
import { axiosInstance } from '../../../axios';
import { useStore } from '../../../store';

export interface IColumns {
	campaignIdx: string;
	token: string;
	campaignName: string;
	campaignType: string;
	mediaName: string;
	trackerName: string;
	campaignStatus: number;
	campaignBlock: number;
}

const CampaignsTable = observer(() => {
	const store = useStore();
	const { campaigns } = store;

	const [data, setData] = useState(campaigns);

	const navigate = useNavigate();

	const { id: paramId } = useParams();

	const confirmBlock = async (idx: string) => {
		updateData(idx, 'campaignBlock');
		try {
			await axiosInstance.patch(`/campaign/${idx}/block`);
		} catch (error) {
			handleError();
		}
	};

	const confirmChange = async (idx: string) => {
		updateData(idx, 'campaignStatus');
		try {
			await axiosInstance.patch(`/campaign/${idx}`);
		} catch (error) {
			handleError();
		}
	};

	const updateData = (idx: string, key: string) => {
		const index = data.findIndex(element => element.campaignIdx === idx);
		const updatedRow = Object.assign(data[index], {
			[key]: +!data[index][key as keyof IColumns],
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

	const handleRowClick = (rowValues: any) => {
		const { mediaName } = rowValues;
		sessionStorage.setItem('eventMediaName', mediaName);
	};

	const columns: Column<IColumns>[] = useMemo(
		() => [
			{
				accessor: 'campaignIdx',
			},
			{
				accessor: 'campaignStatus',
			},
			{
				accessor: 'campaignBlock',
			},
			{
				accessor: 'token',
			},
			{
				Header: '매체',
				accessor: 'mediaName',
				maxWidth: 60,
			},
			{
				Header: '타입',
				accessor: 'campaignType',
				align: 'left',
				maxWidth: 30,
			},
			{
				Header: '캠페인명',
				accessor: 'campaignName',
				align: 'left',
				width: 160,
				Cell: (info: any) => {
					const {
						row: { values },
					} = info;
					const { campaignIdx, campaignName } = values;
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
			},
			{
				Header: '예약 변경',
				id: 'change-switch',
				Cell: (info: any) => {
					const {
						row: {
							values: { campaignIdx, campaignStatus },
						},
					} = info;
					return (
						<Popconfirm
							title="진행하시겠습니까?"
							onConfirm={() => confirmChange(campaignIdx)}
							okText="Yes"
							cancelText="No"
						>
							<Switch checked={campaignStatus} size="small" />
						</Popconfirm>
					);
				},
			},
			{
				Header: 'block',
				id: 'block-switch',
				Cell: (info: any) => {
					const {
						row: {
							values: { campaignIdx, campaignBlock },
						},
					} = info;
					return (
						<Popconfirm
							title="진행하시겠습니까?"
							onConfirm={() => confirmBlock(campaignIdx)}
							okText="Yes"
							cancelText="No"
						>
							<Switch checked={campaignBlock} size="small" />
						</Popconfirm>
					);
				},
			},
		],
		[],
	);

	const headerProps = (props: any, { column }: any) => getStyles(props, column.align);

	const cellProps = (props: any, { cell }: any) => getStyles(props, cell.column.align);

	const rowProps = (props: any, { row }: any) => getRowStyles(props, row.values.campaignStatus);

	const getRowStyles = (props: any, campaignStatus: number) => [
		props,
		{
			style: {
				backgroundColor: campaignStatus === 0 && '#f8f8f8',
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
			minWidth: 45,
			width: 70,
			maxWidth: 300,
		}),
		[],
	);

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
		{
			defaultColumn,
			columns,
			data,
			initialState: { hiddenColumns: ['campaignIdx', 'campaignStatus', 'token', 'campaignBlock'] },
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
							<tr
								role="button"
								tabIndex={0}
								onClick={() => handleRowClick(row.values)}
								onKeyDown={() => handleRowClick(row.values)}
								{...row.getRowProps(rowProps)}
								className="tr"
							>
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
			</table>
		</TableStyles>
	);
});

export default CampaignsTable;
