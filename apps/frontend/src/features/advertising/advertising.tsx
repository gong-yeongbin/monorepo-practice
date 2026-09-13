import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { observer } from 'mobx-react';
import { Input, Table as EmptyTable } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useStore } from '@/app/store';
import AdvertisingTable, { rowsPerPage } from '@/features/advertising/advertising-table';
import AdvertiserForm from '@/features/advertising/advertiser-form';
import {
	Nav,
	NavBtn,
	NavLeft,
	NavRight,
	PaddingContainer,
	TableContainer,
} from '@/app/global-styles';
import { api } from '@/shared/api/api';

const { Search } = Input;

const Advertising = observer(() => {
	const [searchWords, setSearchWords] = useState('');
	const [page, setPage] = useState(1);
	const [drawerVisible, setDrawerVisible] = useState(false);

	const store = useStore();

	const navigate = useNavigate();

	useEffect(() => {
		store.setPageTitle('광고앱 관리');
	}, []);

	const dependency = {
		searchWords,
		page,
		pageSize: rowsPerPage,
	};

	// 서버 페이징. 페이지 전환 중에는 이전 페이지를 유지해 테이블이 비었다 다시 그려지지 않게 한다
	const { isFetching, data } = useQuery({
		queryKey: ['advertising', dependency],
		queryFn: () => api.getAdvertising(dependency),
		placeholderData: keepPreviousData,
	});

	// 검색 조건이 바뀌면 1페이지부터
	const handleSearch = (value: string) => {
		setSearchWords(value);
		setPage(1);
	};

	const handleSearchChange = (e: any) => {
		if (e.target.value === '') {
			setSearchWords('');
			setPage(1);
		}
	};

	const handleAddBtn = () => {
		setDrawerVisible(true);
	};

	return (
		<PaddingContainer>
			<Nav>
				<NavLeft>
					<Search
						loading={isFetching}
						style={{ width: 200, marginBottom: '1rem' }}
						onSearch={handleSearch}
						onChange={handleSearchChange}
						allowClear
					/>
				</NavLeft>
				<NavRight>
					<NavBtn icon={<PlusOutlined />} onClick={handleAddBtn}>
						광고 등록
					</NavBtn>
					<AdvertiserForm drawerVisible={drawerVisible} setDrawerVisible={setDrawerVisible} />
				</NavRight>
			</Nav>

			<TableContainer>
				{data && data.items.length > 0 ? (
					<AdvertisingTable data={data.items} page={page} total={data.total} onPageChange={setPage} />
				) : (
					<EmptyTable />
				)}
			</TableContainer>
		</PaddingContainer>
	);
});

export default Advertising;
