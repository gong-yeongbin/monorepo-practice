import React from 'react';
import { observer } from 'mobx-react';
import { GridColDef, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { getCell } from '../../getCell';
import { StyledDataGrid } from '../../globalStyles';

export interface IColumns {
	carrier: string;
	country: string;
	language: string;
	ip: string;
	adid: string;
	clickId: string;
	viewCode: string;
	pubId: string;
	subId: string;
	eventName: string;
	eventTime: string;
	installTime: string;
	sendTime?: string;
	sendUrl?: string;
	revenue: number;
	currency?: string;
}

const EventTable = observer(
	(props: { data: Array<IColumns>; titleRef: React.RefObject<HTMLSpanElement | null> }) => {
		const { data, titleRef } = props;

		const rows = data.map((obj, i) => ({ ...obj, id: i + 1 }));

		const columns: GridColDef[] = [
			{
				headerName: 'NO',
				field: 'id',
				sortable: false,
				width: 20,
				align: 'center',
				headerAlign: 'center',
			},
			{
				headerName: 'CARRIER',
				field: 'carrier',
				sortable: false,
				width: 85,
				align: 'center',
				headerAlign: 'center',
				valueGetter: value => value || '-',
			},
			{
				headerName: 'COUNTRY',
				field: 'country',
				sortable: false,
				width: 80,
				align: 'center',
				headerAlign: 'center',
				valueGetter: value => value || '-',
			},
			{
				headerName: 'LANGUAGE',
				field: 'language',
				sortable: false,
				width: 90,
				align: 'center',
				headerAlign: 'center',
				valueGetter: value => {
					if (!value) {
						return '-';
					}
					return value === '한국어' ? 'KO' : value;
				},
			},
			{
				headerName: 'IP',
				field: 'ip',
				sortable: false,
				width: 120,
				align: 'center',
				headerAlign: 'center',
				valueGetter: value => value || '-',
			},
			{
				headerName: 'ADID',
				field: 'adid',
				sortable: false,
				flex: 0.2,
				minWidth: 150,
				align: 'center',
				headerAlign: 'center',
				valueGetter: value => value || '-',
			},
			{
				headerName: 'CLICK ID',
				field: 'clickId',
				sortable: false,
				flex: 0.2,
				minWidth: 150,
				align: 'center',
				headerAlign: 'center',
				valueGetter: value => value || '-',
			},
			{
				headerName: 'VIEW CODE',
				field: 'viewCode',
				sortable: false,
				flex: 0.2,
				minWidth: 150,
				align: 'center',
				headerAlign: 'center',
				valueGetter: value => value || '-',
			},
			{
				headerName: 'PUB ID',
				field: 'pubId',
				sortable: false,
				flex: 0.2,
				minWidth: 100,
				align: 'center',
				headerAlign: 'center',
				valueGetter: value => value || '-',
			},
			{
				headerName: 'SUB ID',
				field: 'subId',
				sortable: false,
				flex: 0.2,
				minWidth: 120,
				align: 'center',
				headerAlign: 'center',
				valueGetter: value => value || '-',
			},
			{
				headerName: 'MEDIA',
				field: 'MEDIA',
				minWidth: 80,
				sortable: false,
				align: 'center',
				headerAlign: 'center',
				valueGetter: () => sessionStorage.getItem('mediaName'),
			},
			{
				headerName: 'EVENT',
				field: 'eventName',
				sortable: false,
				minWidth: 100,
				align: 'center',
				headerAlign: 'center',
				valueGetter: value => value || '-',
			},
			{
				headerName: 'EVENT TIME (tracker)',
				field: 'eventTime',
				sortable: false,
				width: 90,
				align: 'center',
				headerAlign: 'center',
				renderCell: info => getCell.time(info),
			},
			{
				headerName: 'INSTALL TIME (tracker)',
				field: 'installTime',
				sortable: false,
				width: 100,
				align: 'center',
				headerAlign: 'center',
				renderCell: info => getCell.time(info),
			},
			{
				headerName: 'SENDING TIME',
				field: 'sendTime',
				sortable: false,
				width: 90,
				align: 'center',
				headerAlign: 'center',
				renderCell: info => getCell.time(info),
			},
			{
				headerName: 'SEND URL',
				field: 'sendUrl',
			},
			{
				headerName: 'REVENUE',
				field: 'revenue',
				sortable: false,
				flex: 0.2,
				minWidth: 100,
				align: 'center',
				headerAlign: 'center',
				valueGetter: value =>
					value ? String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0,
			},
			{
				headerName: 'CURRENCY',
				field: 'currency',
				sortable: false,
				width: 85,
				align: 'center',
				headerAlign: 'center',
				valueGetter: value => value || '-',
			},
		];

		const setFileName = () => {
			const modalTitle = titleRef.current?.outerText;
			const noSpace = modalTitle?.replaceAll(' ', '');
			const noAdvertiser = noSpace?.replace(/(\[\D+\])/g, '');
			return noAdvertiser;
		};

		const CustomToolbar = () => {
			return (
				<GridToolbarContainer>
					<GridToolbarExport
						csvOptions={{
							allColumns: true,
							fileName: setFileName(),
						}}
						printOptions={{
							disableToolbarButton: true,
						}}
					/>
				</GridToolbarContainer>
			);
		};

		return (
			<div style={{ height: '100%', width: '100%' }}>
				<StyledDataGrid
					rows={rows}
					columns={columns}
					slots={{ toolbar: CustomToolbar }}
					initialState={{ columns: { columnVisibilityModel: { sendUrl: false } } }}
					disableColumnFilter
					disableColumnMenu
					disableRowSelectionOnClick
					rowHeight={70}
					sx={{ border: 0 }}
				/>
			</div>
		);
	},
);

export default EventTable;
