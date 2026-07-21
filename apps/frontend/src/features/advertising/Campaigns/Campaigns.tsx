import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Skeleton, Table as EmptyTable } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/app/store';
import InfoCard from '@/shared/ui/InfoCard/InfoCard';
import { axiosInstance } from '@/shared/api/axios';
import CampaignTable from '@/features/advertising/Campaigns/Table';
import AddForm from '@/features/advertising/Campaigns/AddForm';
import {
	Nav,
	NavBtn,
	NavLeft,
	NavRight,
	PaddingContainer,
	TableContainer,
} from '@/app/globalStyles';
import { api } from '@/shared/api/api';

const Campaigns = () => {
	const [drawerVisible, setDrawerVisible] = useState(false);

	const store = useStore();

	const navigate = useNavigate();

	const { id: paramId } = useParams();

	useEffect(() => {
		store.setPageTitle('캠페인 리스트');
	}, []);

	const { isFetching, data, error } = useQuery({
		queryKey: ['campaignList'],
		queryFn: () => api.getCampaigns(paramId),
	});

	const handleErrors = (err: unknown) => {
		if (err instanceof Error && err.message.includes('400')) {
			navigate('/');
		} else {
			sessionStorage.clear();
			navigate('/login');
		}
	};

	useEffect(() => {
		if (error) handleErrors(error);
	}, [error]);

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
				) : data && data.length > 0 ? (
					<CampaignTable data={data} />
				) : (
					<EmptyTable />
				)}
			</TableContainer>
		</PaddingContainer>
	);
};

export default Campaigns;
