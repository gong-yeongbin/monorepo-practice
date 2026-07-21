import React, { useEffect, useState } from 'react';
import { useNavigate, useMatch } from 'react-router';
import { Modal, Skeleton } from 'antd';
import { observer } from 'mobx-react';
import { useStore } from '@/app/store';
import { axiosInstance } from '@/shared/api/axios';
import UnregisteredTable, { UnregisteredModalColumns } from '@/shared/ui/modals/unregistered-table';

const UnregisteredModal = observer(
	(props: {
		unregisteredVisible: boolean;
		setUnregisteredVisible: React.Dispatch<React.SetStateAction<boolean>>;
	}) => {
		const { unregisteredVisible, setUnregisteredVisible } = props;

		const [loading, setLoading] = useState(false);
		const [data, setData] = useState<Array<UnregisteredModalColumns>>([]);

		const navigate = useNavigate();

		const store = useStore();
		const { info } = store;
		const { advertising, advertiser, tracker } = info;

		const isCurrentPageDaily = useMatch('/:id/daily');

		const startDate = sessionStorage.getItem('startDate');
		const endDate = sessionStorage.getItem('endDate');
		const dailyDate = sessionStorage.getItem('dailyDate');

		useEffect(() => {
			if (unregisteredVisible) {
				getUnregistered();
			}
		}, [unregisteredVisible]);

		const getUnregistered = async () => {
			try {
				setLoading(true);
				const token = sessionStorage.getItem('detailToken');
				let url = `/unregistered/${tracker}?startDate=${startDate}&endDate=${endDate}&token=${token}`;
				if (isCurrentPageDaily) {
					url = `/unregistered/${tracker}?startDate=${dailyDate}&endDate=${dailyDate}&token=${token}`;
				}
				const res = await axiosInstance.get(url);
				setData(res.data.data);
				setLoading(false);
			} catch (error) {
				sessionStorage.clear();
				navigate('/login');
			}
		};

		const handleModalClose = () => {
			setUnregisteredVisible(false);
		};

		return (
			<Modal
				title={
					<span>
						<strong>
							{isCurrentPageDaily
								? dailyDate
								: startDate === endDate
								? startDate?.slice(2)
								: `${startDate?.slice(2)} ~ ${endDate?.slice(2)}`}{' '}
							미등록 이벤트
						</strong>{' '}
						|<span style={{ color: 'var(--grey)' }}> [광고주] </span>
						{advertiser} |<span style={{ color: 'var(--grey)' }}> [광고] </span>
						{advertising} |<span style={{ color: 'var(--grey)' }}> [트래커] </span>
						{tracker}
					</span>
				}
				visible={unregisteredVisible}
				onCancel={handleModalClose}
				footer={null}
				width="50vw"
				style={{ minWidth: '42rem' }}
				centered
			>
				{loading ? (
					<Skeleton active title={false} paragraph={{ width: '100%', rows: 3 }} />
				) : (
					<UnregisteredTable data={data} />
				)}
			</Modal>
		);
	},
);

export default UnregisteredModal;
