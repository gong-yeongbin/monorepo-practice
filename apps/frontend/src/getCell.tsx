import React from 'react';
import { Typography } from 'antd';
import { useStore } from './store';

const normal = (info: any) => {
	const columnName = info.column.id;
	const columnValue = info.row.original[columnName];
	return columnValue ? columnValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0;
};

const linkedInstall = (
	info: any,
	setInstallVisible: React.Dispatch<React.SetStateAction<boolean>>,
) => {
	const columnName = info.column.id;
	const cellValue = info.row.original[columnName].toString();
	return cellValue > 0 ? (
		<Typography.Link
			onClick={() => {
				setInstallVisible(true);
			}}
		>
			{cellValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
		</Typography.Link>
	) : (
		cellValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	);
};

const event = (info: any, setEventVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
	const store = useStore();
	const columnName = info.column.id;
	const cellValue = info.row.original[columnName].toString();
	return cellValue > 0 ? (
		<Typography.Link
			onClick={() => {
				setEventVisible(true);
				store.setEventName(columnName);
			}}
		>
			{cellValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
		</Typography.Link>
	) : (
		cellValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	);
};

const cvr = (info: any) => {
	return `${info.row.original.cvr
		.toFixed(2)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}%`;
};

const unregistered = (
	info: any,
	setUnregisteredVisible: React.Dispatch<React.SetStateAction<boolean>>,
) => {
	const {
		row: {
			original: { unregistered },
		},
	} = info;
	return unregistered > 0 ? (
		<Typography.Link
			onClick={() => {
				setUnregisteredVisible(true);
			}}
		>
			{unregistered.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
		</Typography.Link>
	) : (
		unregistered.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	);
};

const status = (info: any) => {
	return info.row.original.status === 1 ? '진행 중' : '-';
};

const createdAt = (info: any) => {
	return info.row.original.createdAt.slice(2, 10);
};

export const getCell = {
	normal,
	linkedInstall,
	event,
	cvr,
	unregistered,
	status,
	createdAt,
};
