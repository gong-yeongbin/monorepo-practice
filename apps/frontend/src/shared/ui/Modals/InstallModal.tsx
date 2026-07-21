import React, { useEffect, useRef, useState } from 'react';
import { Modal, Skeleton } from 'antd';
import { observer } from 'mobx-react';
import { useNavigate, useMatch } from 'react-router';
import { useStore } from '@/app/store';
import { axiosInstance } from '@/shared/api/axios';
import InstallTable, { IColumns } from '@/shared/ui/Modals/InstallTable';

const InstallModal = observer(
	(props: {
		installVisible: boolean;
		setInstallVisible: React.Dispatch<React.SetStateAction<boolean>>;
	}) => {
		const { installVisible, setInstallVisible } = props;

		const [loading, setLoading] = useState(false);
		const [data, setData] = useState<Array<IColumns>>([]);

		const titleRef = useRef<HTMLSpanElement>(null);

		const navigate = useNavigate();

		const store = useStore();
		const { info } = store;
		const { advertising, advertiser, tracker } = info;

		const isPageDaily = useMatch('/:id/daily');
		const isPageDailyDetail = useMatch('/:id/daily/detail');

		useEffect(() => {
			if (installVisible) {
				getPostbackInstall();
			}
		}, [installVisible]);

		const startDate = sessionStorage.getItem('startDate');
		const endDate = sessionStorage.getItem('endDate');
		const dailyDate = sessionStorage.getItem('dailyDate');
		const dailyDetailStartDate = sessionStorage.getItem('dailyDetailStartDate');
		const dailyDetailEndDate = sessionStorage.getItem('dailyDetailEndDate');
		const viewCode = sessionStorage.getItem('viewCode');

		const getPostbackInstall = async () => {
			try {
				setLoading(true);
				const token = sessionStorage.getItem('detailToken');
				let url = `/install/${tracker}?startDate=${startDate}&endDate=${endDate}&token=${token}&offset=${0}&limit=0`;
				if (isPageDaily) {
					url = `/install/${tracker}?startDate=${dailyDate}&endDate=${dailyDate}&token=${token}&offset=${0}&limit=0`;
				} else if (isPageDailyDetail) {
					url = `/install/${tracker}?startDate=${dailyDetailStartDate}&endDate=${dailyDetailEndDate}&offset=${0}&limit=0&viewCode=${viewCode}`;
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
			setInstallVisible(false);
		};

		const showSelectedDate = () => {
			if (isPageDaily) {
				return dailyDate?.slice(2);
			}
			if (isPageDailyDetail && dailyDetailStartDate === dailyDetailEndDate) {
				return dailyDetailEndDate?.slice(2);
			}
			if (isPageDailyDetail && dailyDetailStartDate !== dailyDetailEndDate) {
				return `${dailyDetailStartDate?.slice(2)} ~ ${dailyDetailEndDate?.slice(2)}`;
			}
			if (startDate === endDate) {
				return startDate?.slice(2);
			}
			return `${startDate?.slice(2)} ~ ${endDate?.slice(2)}`;
		};

		return (
			<Modal
				title={
					<span ref={titleRef}>
						<strong>{showSelectedDate()} 신규 실행</strong> |
						<span style={{ color: 'var(--grey)' }}> [광고주] </span>
						{advertiser} |<span style={{ color: 'var(--grey)' }}> [광고] </span>
						{advertising}
					</span>
				}
				visible={installVisible}
				onCancel={handleModalClose}
				footer={null}
				width="100vw"
				style={{ top: 10 }}
				bodyStyle={{ overflow: 'auto', height: '87vh' }}
				className="table-modal"
			>
				{loading ? (
					<Skeleton active title={false} paragraph={{ width: '100%', rows: 50 }} />
				) : (
					<InstallTable data={data} titleRef={titleRef} />
				)}
			</Modal>
		);
	},
);

export default InstallModal;
