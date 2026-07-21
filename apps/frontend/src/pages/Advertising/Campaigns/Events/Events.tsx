import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { observer } from 'mobx-react';
import { Skeleton, Table as EmptyTable, Button, Popconfirm, message } from 'antd';
import { ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench } from '@fortawesome/free-solid-svg-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../../../../store';
import InfoCard from '../../../../components/InfoCard';
import { axiosInstance } from '../../../../axios';
import EventTable, { IColumns } from './Table';
import EditTable from './EditTable';
import {
	Nav,
	NavBtn,
	NavLeft,
	NavRight,
	PaddingContainer,
	TableContainer,
} from '../../../../globalStyles';
import { api } from '../../../../api';

const Events = observer(() => {
	const [editMode, setEditMode] = useState(false);
	const [newEvents, setNewEvents] = useState<Array<IColumns>>([]);

	const store = useStore();
	const { campaignEvents: events } = store;

	const navigate = useNavigate();

	const { campaignIdx: paramCampaignIdx } = useParams();

	const queryClient = useQueryClient();

	useEffect(() => {
		store.setPageTitle('캠페인 이벤트');
	}, []);

	const { isFetching, data, error } = useQuery({
		queryKey: ['campaignEvents'],
		queryFn: () => api.getCampaignEvents(paramCampaignIdx),
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
		else if (data) store.setCampaignEvents(data);
	}, [data, error]);

	const handleManageBtn = async () => {
		setEditMode(true);
	};

	const handleSubmit = async () => {
		try {
			await axiosInstance.patch(`/campaign/${paramCampaignIdx}/event`, newEvents);
			queryClient.invalidateQueries({ queryKey: ['campaignEvents'] });
			setEditMode(false);
			message.success('변경 사항을 저장했습니다.');
		} catch (error) {
			sessionStorage.clear();
			navigate('/login');
		}
	};

	return (
		<PaddingContainer>
			<InfoCard />

			<Nav>
				<NavLeft />
				<NavRight>
					{editMode && (
						<Button
							icon={<ArrowLeftOutlined />}
							onClick={() => setEditMode(false)}
							style={{
								width: '7rem',
								marginRight: '0.5rem',
							}}
						>
							취소
						</Button>
					)}
					{editMode ? (
						<Popconfirm
							title="변경 사항을 저장합니다."
							onConfirm={handleSubmit}
							okText="Yes"
							cancelText="No"
						>
							<NavBtn
								icon={<CheckOutlined />}
								style={{
									width: '7rem',
								}}
							>
								확인
							</NavBtn>
						</Popconfirm>
					) : (
						<NavBtn
							icon={<FontAwesomeIcon icon={faWrench} style={{ marginRight: '0.4rem' }} />}
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: '7rem',
							}}
							onClick={handleManageBtn}
						>
							관리
						</NavBtn>
					)}
				</NavRight>
			</Nav>

			<TableContainer>
				{isFetching ? (
					<Skeleton active title={false} paragraph={{ width: '100%', rows: 11 }} />
				) : events?.length > 0 ? (
					editMode ? (
						<EditTable events={events} setNewEvents={setNewEvents} />
					) : (
						<EventTable events={events} />
					)
				) : (
					<EmptyTable />
				)}
			</TableContainer>
		</PaddingContainer>
	);
});

export default Events;
