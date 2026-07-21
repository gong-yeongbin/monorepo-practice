import React from 'react';
import { observer } from 'mobx-react';
import { Button, Table, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';

export interface InstallModalColumns {
	carrier: string;
	country: string;
	language: string;
	ip: string;
	adid: string;
	clickId: string;
	viewCode: string;
	pubId: string;
	subId: string;
	clickTime: string;
	installTime: string;
	sendTime?: string;
	sendUrl?: string;
}

const dash = (value: unknown) => value || '-';

const timeCell = (value?: string, sendUrl?: string) => {
	if (!value) {
		return '-';
	}
	const formatted = dayjs(value).format('YY-MM-DD HH:mm:ss');
	return sendUrl ? (
		<Tooltip placement="topRight" title={sendUrl} color="var(--grey)">
			{formatted}
		</Tooltip>
	) : (
		formatted
	);
};

const InstallTable = observer(
	(props: { data: Array<InstallModalColumns>; titleRef: React.RefObject<HTMLSpanElement | null> }) => {
		const { data, titleRef } = props;

		const rows = data.map((obj, i) => ({ ...obj, id: i + 1, MEDIA: sessionStorage.getItem('mediaName') }));

		const columns: TableColumnsType<(typeof rows)[number]> = [
			{ title: 'NO', dataIndex: 'id', align: 'center', width: 40 },
			{ title: 'CARRIER', dataIndex: 'carrier', align: 'center', width: 85, render: dash },
			{ title: 'COUNTRY', dataIndex: 'country', align: 'center', width: 80, render: dash },
			{
				title: 'LANGUAGE',
				dataIndex: 'language',
				align: 'center',
				width: 90,
				render: value => (value ? (value === '한국어' ? 'KO' : value) : '-'),
			},
			{ title: 'IP', dataIndex: 'ip', align: 'center', width: 120, render: dash },
			{ title: 'ADID', dataIndex: 'adid', align: 'center', width: 150, render: dash },
			{ title: 'CLICK ID', dataIndex: 'clickId', align: 'center', width: 150, render: dash },
			{ title: 'VIEW CODE', dataIndex: 'viewCode', align: 'center', width: 150, render: dash },
			{ title: 'PUB ID', dataIndex: 'pubId', align: 'center', width: 100, render: dash },
			{ title: 'SUB ID', dataIndex: 'subId', align: 'center', width: 120, render: dash },
			{ title: 'MEDIA', dataIndex: 'MEDIA', align: 'center', width: 80, render: dash },
			{
				title: 'CLICK TIME (tracker)',
				dataIndex: 'clickTime',
				align: 'center',
				width: 110,
				render: value => timeCell(value),
			},
			{
				title: 'INSTALL TIME (tracker)',
				dataIndex: 'installTime',
				align: 'center',
				width: 110,
				render: value => timeCell(value),
			},
			{
				title: 'SENDING TIME',
				dataIndex: 'sendTime',
				align: 'center',
				width: 110,
				render: (value, record) => timeCell(value, record.sendUrl),
			},
		];

		const setFileName = () => {
			const modalTitle = titleRef.current?.outerText;
			const noSpace = modalTitle?.replaceAll(' ', '');
			const noAdvertiser = noSpace?.replace(/(\[\D+\])/g, '');
			return `${noAdvertiser ?? 'install'}.csv`;
		};

		return (
			<div style={{ height: '100%', width: '100%' }}>
				<CSVLink data={data} filename={setFileName()}>
					<Button size="small" style={{ marginBottom: '0.5rem' }}>
						CSV 다운로드
					</Button>
				</CSVLink>
				<Table
					rowKey="id"
					columns={columns}
					dataSource={rows}
					pagination={false}
					size="small"
					scroll={{ x: 'max-content', y: '60vh' }}
				/>
			</div>
		);
	},
);

export default InstallTable;
