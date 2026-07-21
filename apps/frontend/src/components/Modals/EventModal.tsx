import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useMatch } from 'react-router';
import { Modal, Skeleton } from 'antd';
import { observer } from 'mobx-react';
import { axiosInstance } from '../../axios';
import { useStore } from '../../store';
import EventTable, { IColumns } from './EventTable';

const EventModal = observer(
	(props: {
		eventVisible: boolean;
		setEventVisible: React.Dispatch<React.SetStateAction<boolean>>;
	}) => {
		const [title, setTitle] = useState('');
		const [loading, setLoading] = useState(false);
		const [data, setData] = useState<Array<IColumns>>([]);

		const titleRef = useRef<HTMLSpanElement>(null);

		const { eventVisible, setEventVisible } = props;

		const navigate = useNavigate();

		const store = useStore();
		const { info, eventName } = store;
		const { advertising, advertiser, tracker } = info;

		const isPageDaily = useMatch('/:id/daily');
		const isPageDailyDetail = useMatch('/:id/daily/detail');

		const startDate = sessionStorage.getItem('startDate');
		const endDate = sessionStorage.getItem('endDate');
		const dailyDate = sessionStorage.getItem('dailyDate');
		const dailyDetailStartDate = sessionStorage.getItem('dailyDetailStartDate');
		const dailyDetailEndDate = sessionStorage.getItem('dailyDetailEndDate');
		const viewCode = sessionStorage.getItem('viewCode');

		useEffect(() => {
			showTitle();
		}, []);

		useEffect(() => {
			if (eventVisible) {
				getPostbackEvent();
			}
		}, [eventVisible]);

		const getPostbackEvent = async () => {
			try {
				setLoading(true);
				const token = sessionStorage.getItem('detailToken');
				let url = `/event/${tracker}?startDate=${startDate}&endDate=${endDate}&token=${token}&offset=${0}&limit=0&eventName=${eventName}`;
				if (isPageDaily) {
					url = `/event/${tracker}?startDate=${dailyDate}&endDate=${dailyDate}&token=${token}&offset=${0}&limit=0&eventName=${eventName}`;
				} else if (isPageDailyDetail) {
					url = `/event/${tracker}?startDate=${dailyDetailStartDate}&endDate=${dailyDetailEndDate}&token=${token}&offset=${0}&limit=0&eventName=${eventName}&viewCode=${viewCode}`;
				}
				const res = await axiosInstance.get(url);
				setData(res.data.data);
				setLoading(false);
			} catch (error) {
				sessionStorage.clear();
				navigate('/login');
			}
		};

		const showTitle = () => {
			switch (eventName) {
				case 'retention':
					setTitle('재방문');
					break;
				case 'registration':
					setTitle('회원가입');
					break;
				default:
					setTitle('구매');
			}
		};

		const handleModalClose = () => {
			setEventVisible(false);
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
						<strong>
							{showSelectedDate()} {title}
						</strong>{' '}
						|<span style={{ color: 'var(--grey)' }}> [광고주] </span>
						{advertiser} |<span style={{ color: 'var(--grey)' }}> [광고] </span>
						{advertising}
					</span>
				}
				visible={eventVisible}
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
					<EventTable data={data} titleRef={titleRef} />
				)}
			</Modal>
		);
	},
);

export default EventModal;
