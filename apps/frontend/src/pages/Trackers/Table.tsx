import React, { useState, useMemo } from 'react';
import { CopyOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, message, Modal } from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useTable, useFlexLayout, Column } from 'react-table';
import { TableStyles } from '../../globalStyles';

export interface IColumns {
	name: string;
	trackerTrackingUrlTemplate: string;
	mecrossPostbackInstallUrlTemplate: string;
	mecrossPostbackEventUrlTemplate: string;
}

const TrackersTable = (props: { data: [] }) => {
	const { data } = props;

	const [trackerUrlVisible, setTrackerUrlVisible] = useState(false);
	const [InstallUrlVisible, setInstallUrlVisible] = useState(false);
	const [EventUrlVisible, setEventUrlVisible] = useState(false);
	const [urlText, setUrlText] = useState('');

	const handleModalClose = () => {
		setTrackerUrlVisible(false);
		setInstallUrlVisible(false);
		setEventUrlVisible(false);
	};

	const TableButtons = (props: { column: any; cell: any }) => {
		const { column, cell } = props;
		const { value: url } = cell;

		const handleUrlButtonClick = () => {
			setUrlText(url);
			if (column.id === 'trackerTrackingUrlTemplate') {
				setTrackerUrlVisible(true);
			} else if (column.id === 'mecrossPostbackInstallUrlTemplate') {
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

	const columns: Column<IColumns>[] = useMemo(
		() => [
			{
				Header: 'TRACKER',
				accessor: 'name',
			},
			{
				Header: 'TRACKING URL',
				accessor: 'trackerTrackingUrlTemplate',
				Cell: TableButtons,
			},
			{
				Header: 'INSTALL URL',
				accessor: 'mecrossPostbackInstallUrlTemplate',
				Cell: TableButtons,
			},
			{
				Header: 'EVENT URL',
				accessor: 'mecrossPostbackEventUrlTemplate',
				Cell: TableButtons,
			},
		],
		[],
	);

	const cellProps = (props: any, { cell }: any) => getStyles(props, cell.column.align);

	const getStyles = (props: any, align = 'center') => [
		props,
		{
			style: {
				justifyContent: align === 'left' ? 'flex-start' : 'center',
				alignItems: 'flex-start',
				display: 'flex',
			},
		},
	];

	const defaultColumn = useMemo(
		() => ({
			minWidth: 55,
			width: 110,
			maxWidth: 400,
		}),
		[],
	);

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
		{
			defaultColumn,
			columns,
			data,
		},
		useFlexLayout,
	);

	return (
		<TableStyles height="calc(var(--vh, 1vh) * 100 - 16.3rem)">
			{trackerUrlVisible && (
				<Modal
					title="TRACKER TRACKING URL"
					footer={false}
					onCancel={handleModalClose}
					visible={trackerUrlVisible}
				>
					<p>{urlText}</p>
				</Modal>
			)}
			{InstallUrlVisible && (
				<Modal
					title="INSTALL URL"
					footer={false}
					onCancel={handleModalClose}
					visible={InstallUrlVisible}
				>
					<p>{urlText}</p>
				</Modal>
			)}
			{EventUrlVisible && (
				<Modal
					title="EVENT URL"
					footer={false}
					onCancel={handleModalClose}
					visible={EventUrlVisible}
				>
					<p>{urlText}</p>
				</Modal>
			)}
			<table {...getTableProps()} id="trackers-table" className="sticky">
				<thead>
					{headerGroups.map(headerGroup => (
						<tr {...headerGroup.getHeaderGroupProps()} className="tr">
							{headerGroup.headers.map(column => (
								<th {...column.getHeaderProps()} className="th">
									{column.render('Header')}
								</th>
							))}
						</tr>
					))}
				</thead>

				<tbody {...getTableBodyProps()}>
					{rows.map((row, i) => {
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
		</TableStyles>
	);
};

export default TrackersTable;
