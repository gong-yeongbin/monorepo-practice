// 로그인 기록(보안 감사) 목록 — 서버 페이징(최신순). 탭을 열 때만 조회되도록 query를 이 컴포넌트 안에 둔다
import React, { useMemo, useState } from 'react';
import { Pagination, Table as EmptyTable, Tag } from 'antd';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TableStyles } from '@/app/global-styles';
import { PageContainer } from '@/features/developer/login-history-table.styles';
import { api } from '@/shared/api/api';

export interface LoginHistoryColumns {
	idx: string;
	email: string;
	result: string;
	ip: string;
	browser: string | null;
	os: string | null;
	deviceType: string;
	createdAt: string;
}

export const rowsPerPage = 25;

// backend LoginResult enum과 1:1. 모르는 값이 오면 그대로 노출한다
const resultTags: Record<string, { color: string; label: string }> = {
	SUCCESS: { color: 'green', label: '성공' },
	INVALID_CREDENTIALS: { color: 'red', label: '비밀번호 불일치' },
	NOT_APPROVED: { color: 'orange', label: '미승인 계정' },
};

const columnHelper = createColumnHelper<LoginHistoryColumns>();

const LoginHistoryTable = () => {
	const [page, setPage] = useState(1);

	// 페이지 전환 중에는 이전 페이지를 유지해 테이블이 비었다 다시 그려지지 않게 한다
	const { data } = useQuery({
		queryKey: ['login-histories', { page, pageSize: rowsPerPage }],
		queryFn: () => api.getLoginHistories({ page, pageSize: rowsPerPage }),
		placeholderData: keepPreviousData,
	});

	const columns = useMemo(
		() => [
			columnHelper.accessor('createdAt', {
				header: '시각',
				cell: info => dayjs(info.getValue()).format('YYYY-MM-DD HH:mm:ss'),
			}),
			columnHelper.accessor('email', { header: '이메일' }),
			columnHelper.accessor('result', {
				header: '결과',
				cell: info => {
					const tag = resultTags[info.getValue()];
					return tag ? <Tag color={tag.color}>{tag.label}</Tag> : <Tag>{info.getValue()}</Tag>;
				},
			}),
			columnHelper.accessor('ip', { header: 'IP' }),
			columnHelper.accessor('browser', {
				header: '브라우저 / OS',
				// UA를 해석하지 못한 기록(curl 등)은 둘 다 null이다
				cell: info => {
					const { browser, os } = info.row.original;
					return browser || os ? [browser, os].filter(Boolean).join(' · ') : '-';
				},
			}),
			columnHelper.accessor('deviceType', { header: '기기' }),
		],
		[],
	);

	const table = useReactTable({
		data: data?.items ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (!data || data.items.length === 0) {
		return <EmptyTable />;
	}

	return (
		<TableStyles>
			<table id="login-history-table">
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
									<div className="ellipsis">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>

			<PageContainer>
				<Pagination size="small" pageSize={rowsPerPage} current={page} total={data.total} onChange={setPage} />
			</PageContainer>
		</TableStyles>
	);
};

export default LoginHistoryTable;
