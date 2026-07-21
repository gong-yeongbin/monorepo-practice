import React, { useState, useMemo } from 'react';
import { useTable, useResizeColumns, useFlexLayout, Column, usePagination } from 'react-table';
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

	const columns: Column<IColumns>[] = useMemo(
		() => [
			{
				accessor: 'idx',
			},
			{
				accessor: 'status',
			},
			{
				accessor: 'imageUrl',
			},
			{
				accessor: 'platform',
			},
			{
				Header: 'no',
				id: 'no',
				width: 25,
				maxWidth: 25,
				Cell: (info: any) => {
					const { rows, row } = info;
					return rows.length - row.index;
				},
			},
			{
				Header: '광고명',
				accessor: 'name',
				width: 110,
				align: 'left',
				Cell: (info: any) => {
					const {
						row: {
							values: { idx, imageUrl, name },
						},
					} = info;
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
			},
			{
				Header: () => <span style={{ wordBreak: 'keep-all' }}>운영 캠페인</span>,
				accessor: 'campaign',
				width: 50,
			},
			{
				Header: 'ON/OFF',
				id: 'status-switch',
				width: 40,
				Cell: (info: any) => {
					const {
						row: {
							values: { idx, status },
						},
					} = info;
					return (
						<Popconfirm
							title="진행하시겠습니까?"
							onConfirm={() => confirmStatus(idx)}
							okText="Yes"
							cancelText="No"
						>
							<Switch checked={status} size="small" />
						</Popconfirm>
					);
				},
			},
		] as Column<IColumns>[],
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

	const defaultColumn = useMemo(() => ({}), []);

	const { getTableProps, getTableBodyProps, headerGroups, prepareRow, page, gotoPage } = useTable(
		{
			defaultColumn,
			columns,
			data,
			initialState: {
				hiddenColumns: ['idx', 'status', 'imageUrl', 'platform'],
				pageIndex: 0,
				pageSize: rowsPerPage,
			},
		},
		useResizeColumns,
		useFlexLayout,
		usePagination,
	);

	return (
		<TableStyles>
			<table {...getTableProps()} id="ad-table">
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
					{page.map((row, i) => {
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
			</table>

			<PageContainer>
				<Pagination
					size="small"
					pageSize={rowsPerPage}
					total={data.length}
					onChange={(page, _pageSize) => gotoPage(page - 1)}
				/>
			</PageContainer>
		</TableStyles>
	);
});

export default AdvertisingTable;
