import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { observer } from 'mobx-react';
import { Input, Table as EmptyTable } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/app/store';
import AdvertisingTable from '@/features/advertising/advertising-table';
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
	const [drawerVisible, setDrawerVisible] = useState(false);

	const store = useStore();

	const navigate = useNavigate();

	useEffect(() => {
		store.setPageTitle('광고앱 관리');
	}, []);

	const dependency = {
		searchWords,
	};

	const { isFetching, data } = useQuery({
		queryKey: ['advertising', dependency],
		queryFn: () => api.getAdvertising(dependency),
	});

	const handleSearch = (value: string) => setSearchWords(value);

	const handleSearchChange = (e: any) => {
		if (e.target.value === '') {
			setSearchWords('');
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
				{data?.length > 0 ? (
					<AdvertisingTable data={data} />
				) : (
					<EmptyTable />
				)}
			</TableContainer>
		</PaddingContainer>
	);
});

export default Advertising;
