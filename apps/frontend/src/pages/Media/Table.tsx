import React, { useState, useMemo } from 'react';
import { CopyOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, message, Modal } from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	createColumnHelper,
	CellContext,
} from '@tanstack/react-table';
import { TableStyles } from '../../globalStyles';

export interface IColumns {
	name: string;
	mediaPostbackInstallUrlTemplate: string;
	mediaPostbackEventUrlTemplate: string;
	campaign: number;
}

const columnHelper = createColumnHelper<IColumns>();

const MediaTable = (props: { data: IColumns[] }) => {
	const { data } = props;

	const [InstallUrlVisible, setInstallUrlVisible] = useState(false);
	const [EventUrlVisible, setEventUrlVisible] = useState(false);
	const [urlText, setUrlText] = useState('');

	const handleModalClose = () => {
		setInstallUrlVisible(false);
		setEventUrlVisible(false);
	};

	const TableButtons = (info: CellContext<IColumns, string>) => {
		const url = info.getValue();
		const columnId = info.column.id;

		const handleUrlButtonClick = () => {
			setUrlText(url);
			if (columnId === 'mediaPostbackInstallUrlTemplate') {
				setInstallUrlVisible(true);
			} else {
				setEventUrlVisible(true);
			}
		};

		const showCopySuccess = () => {
			message.success(`URL을 클립보드에 복사했습니다.`);
		};

		return (
			<>
				<Button
					icon={<SearchOutlined />}
					shape="circle"
					size="small"
					style={{ marginRight: '0.5rem' }}
					onClick={handleUrlButtonClick}
				/>
				<CopyToClipboard text={url} onCopy={showCopySuccess}>
					<Button
						icon={<CopyOutlined />}
						shape="circle"
						size="small"
						style={{ color: 'var(--blue)' }}
					/>
				</CopyToClipboard>
			</>
		);
	};

	const columns = useMemo(
		() => [
			columnHelper.accessor('name', { header: 'media' }),
			columnHelper.accessor('mediaPostbackInstallUrlTemplate', {
				header: 'INSTALL URL',
				cell: TableButtons,
			}),
			columnHelper.accessor('mediaPostbackEventUrlTemplate', {
				header: 'EVENT URL',
				cell: TableButtons,
			}),
			columnHelper.accessor('campaign', { header: '전체 광고' }),
		],
		[],
	);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<TableStyles height="calc(var(--vh, 1vh) * 100 - 16.3rem)">
			{InstallUrlVisible && (
				<Modal
					title="INSTALL URL"
					footer={false}
					onCancel={handleModalClose}
					open={InstallUrlVisible}
				>
					<p>{urlText}</p>
				</Modal>
			)}
			{EventUrlVisible && (
				<Modal
					title="EVENT URL"
					footer={false}
					onCancel={handleModalClose}
					open={EventUrlVisible}
				>
					<p>{urlText}</p>
				</Modal>
			)}
			<table id="media-table" className="sticky">
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

				<tbody>
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
		</TableStyles>
	);
};

export default MediaTable;
