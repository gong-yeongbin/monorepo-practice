import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Skeleton, Table as EmptyTable } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import { useStore } from '../../../store';
import InfoCard from '../../../components/InfoCard';
import { axiosInstance } from '../../../axios';
import CampaignTable from './Table';
import AddForm from './AddForm';
import {
	Nav,
	NavBtn,
	NavLeft,
	NavRight,
	PaddingContainer,
	TableContainer,
} from '../../../globalStyles';
import { api } from '../../../api';

const Campaigns = observer(() => {
	const [drawerVisible, setDrawerVisible] = useState(false);

	const store = useStore();
	const { campaigns } = store;

	const navigate = useNavigate();

	const { id: paramId } = useParams();

	useEffect(() => {
		store.setPageTitle('캠페인 리스트');
	}, []);

	const { isFetching } = useQuery(['campaignList'], () => api.getCampaigns(paramId), {
		onSuccess: data => {
			store.setCampaigns(data);
		},
		onError: error => {
			handleErrors(error);
		},
	});

	const handleErrors = (error: unknown) => {
		if (error instanceof Error && error.message.includes('400')) {
			navigate('/');
		} else {
			sessionStorage.clear();
			navigate('/login');
		}
	};

	const handleAddBtn = async () => {
		setDrawerVisible(true);
	};

	return (
		<PaddingContainer>
			<InfoCard />

			<Nav>
				<NavLeft />
				<NavRight>
					<NavBtn icon={<PlusOutlined />} onClick={handleAddBtn}>
						캠페인 등록
					</NavBtn>
					<AddForm drawerVisible={drawerVisible} setDrawerVisible={setDrawerVisible} />
				</NavRight>
			</Nav>

			<TableContainer>
				{isFetching ? (
					<Skeleton active title={false} paragraph={{ width: '100%', rows: 11 }} />
				) : campaigns?.length > 0 ? (
					<CampaignTable />
				) : (
					<EmptyTable />
				)}
			</TableContainer>
		</PaddingContainer>
	);
});

export default Campaigns;
