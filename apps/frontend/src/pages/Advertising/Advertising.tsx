import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Select, Input, Skeleton, Table as EmptyTable } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import { useStore } from '../../store';
import AdvertisingTable from './Table';
import AddForm from './AddForm';
import {
	Nav,
	NavBtn,
	NavLeft,
	NavRight,
	PaddingContainer,
	TableContainer,
} from '../../globalStyles';
import { api } from '../../api';

const { Option } = Select;
const { Search } = Input;

const Advertising = observer(() => {
	const [status, setStatus] = useState(1);
	const [searchWords, setSearchWords] = useState('');
	const [drawerVisible, setDrawerVisible] = useState(false);

	const store = useStore();

	const navigate = useNavigate();

	useEffect(() => {
		store.setPageTitle('광고앱 관리');
	}, []);

	const dependency = {
		status,
		searchWords,
	};

	const { isFetching, data } = useQuery(
		['advertising', dependency],
		() => api.getAdvertising(dependency),
		{
			onError: () => {
				sessionStorage.clear();
				navigate('/login');
			},
		},
	);

	const handleStatusChange = (value: string) => {
		if (value === 'on') {
			setStatus(1);
		} else {
			setStatus(0);
		}
	};

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
					<Select
						defaultValue="on"
						style={{ width: 65, marginRight: '0.5rem', marginBottom: '1rem' }}
						onChange={handleStatusChange}
					>
						<Option value="on">ON</Option>
						<Option value="off">OFF</Option>
					</Select>
					<Search
						loading={isFetching}
						style={{ width: 200 }}
						onSearch={handleSearch}
						onChange={handleSearchChange}
						allowClear
					/>
				</NavLeft>
				<NavRight>
					<NavBtn icon={<PlusOutlined />} onClick={handleAddBtn}>
						광고 등록
					</NavBtn>
					<AddForm drawerVisible={drawerVisible} setDrawerVisible={setDrawerVisible} />
				</NavRight>
			</Nav>

			<TableContainer>
				{isFetching ? (
					<Skeleton active title={false} paragraph={{ width: '100%', rows: 11 }} />
				) : data?.length > 0 ? (
					<AdvertisingTable data={data} />
				) : (
					<EmptyTable />
				)}
			</TableContainer>
		</PaddingContainer>
	);
});

export default Advertising;
