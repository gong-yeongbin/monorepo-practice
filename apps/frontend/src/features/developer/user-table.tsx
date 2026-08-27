// 사용자 목록 테이블 — 역할 변경, 볼 수 있는 광고 지정, 가입 승인을 처리한다
import React, { useMemo, useState } from 'react';
import { Button, Popconfirm, Select, Tag, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { TableStyles } from '@/app/global-styles';
import { ROLES } from '@/shared/lib/auth';
import SelectOptions from '@/shared/ui/select-options';
import { api } from '@/shared/api/api';

export interface UserColumns {
	idx: string;
	email: string;
	role: string;
	approved: boolean;
	createdAt: string;
	advertisingIds: string[];
}

export interface AdvertisingOption {
	idx: string;
	name: string;
}

const columnHelper = createColumnHelper<UserColumns>();

const UserTable = (props: { data: UserColumns[]; advertisingOptions: AdvertisingOption[] }) => {
	const { data, advertisingOptions } = props;
	const queryClient = useQueryClient();

	// 서버는 advertising_ids를 통째로 교체하므로 부분 전송이 위험하다.
	// 선택을 즉시 보내지 않고 행별 편집 상태로 모아 뒀다가 버튼을 눌러야 PATCH한다.
	const [edits, setEdits] = useState<Record<string, { role: string; advertisingIds: string[] }>>({});

	const editOf = (row: UserColumns) => edits[row.idx] ?? { role: row.role, advertisingIds: row.advertisingIds };

	const patchEdit = (row: UserColumns, patch: Partial<{ role: string; advertisingIds: string[] }>) => {
		setEdits(prev => ({ ...prev, [row.idx]: { ...editOf(row), ...patch } }));
	};

	const mutation = useMutation({
		mutationFn: api.updateUser,
		onSuccess: () => {
			message.success('저장했습니다.');
			setEdits({});
			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
	});

	const submit = (row: UserColumns, approved?: boolean) => {
		const edit = editOf(row);
		mutation.mutate({ idx: row.idx, role: edit.role, advertisingIds: edit.advertisingIds, ...(approved !== undefined && { approved }) });
	};

	const columns = useMemo(
		() => [
			columnHelper.accessor('email', { header: '이메일' }),
			columnHelper.accessor('role', {
				header: '역할',
				cell: info => (
					<Select
						value={editOf(info.row.original).role}
						style={{ width: '100%' }}
						onChange={value => patchEdit(info.row.original, { role: value })}
					>
						{ROLES.map(role => SelectOptions({ idx: role, name: role }))}
					</Select>
				),
			}),
			columnHelper.accessor('advertisingIds', {
				header: '볼 수 있는 광고',
				cell: info => {
					const row = info.row.original;
					const edit = editOf(row);

					// DEVELOPER·ADMIN은 백엔드에서 스코핑 면제라 허용 목록이 의미가 없다. 화면에서도 그 사실을 드러낸다.
					if (edit.role !== 'USER') {
						return <Tag color="blue">전체 (스코핑 면제)</Tag>;
					}

					return (
						<Select
							mode="multiple"
							allowClear
							value={edit.advertisingIds}
							placeholder="선택하지 않으면 아무 광고도 보이지 않습니다."
							style={{ width: '100%' }}
							onChange={value => patchEdit(row, { advertisingIds: value })}
						>
							{advertisingOptions.map(SelectOptions)}
						</Select>
					);
				},
			}),
			columnHelper.accessor('approved', {
				header: '상태',
				cell: info => (info.getValue() ? <Tag color="green">승인됨</Tag> : <Tag color="orange">승인 대기</Tag>),
			}),
			columnHelper.display({
				id: 'actions',
				header: '',
				cell: info => {
					const row = info.row.original;

					return row.approved ? (
						<Button size="small" loading={mutation.isPending} onClick={() => submit(row)}>
							저장
						</Button>
					) : (
						<Popconfirm title="이 사용자의 가입을 승인할까요?" okText="승인" cancelText="취소" onConfirm={() => submit(row, true)}>
							<Button size="small" type="primary" loading={mutation.isPending}>
								승인
							</Button>
						</Popconfirm>
					);
				},
			}),
		],
		[advertisingOptions, edits, mutation.isPending],
	);

	const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

	return (
		<TableStyles height="calc(var(--vh, 1vh) * 100 - 16.3rem)">
			<table id="user-table" className="sticky">
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
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</TableStyles>
	);
};

export default UserTable;
