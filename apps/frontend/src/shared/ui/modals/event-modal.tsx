import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useMatch } from 'react-router';
import { Modal } from 'antd';
import { observer } from 'mobx-react';
import { api } from '@/shared/api/api';
import { useStore } from '@/app/store';
import EventTable, { EventModalColumns } from '@/shared/ui/modals/event-table';

const EventModal = observer(
	(props: {
		eventVisible: boolean;
		setEventVisible: React.Dispatch<React.SetStateAction<boolean>>;
	}) => {
		const [title, setTitle] = useState('');
		const [data, setData] = useState<Array<EventModalColumns>>([]);

		const titleRef = useRef<HTMLSpanElement>(null);

		const { eventVisible, setEventVisible } = props;

		const navigate = useNavigate();

		const store = useStore();
		const { info, eventName } = store;
		const { advertising, advertiser } = info;

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
				const token = sessionStorage.getItem('detailToken');
				let params: Parameters<typeof api.getPostbackEvents>[0] = { startDate, endDate, token, eventName };
				if (isPageDaily) {
					params = { startDate: dailyDate, endDate: dailyDate, token, eventName };
				} else if (isPageDailyDetail) {
					params = {
						startDate: dailyDetailStartDate,
						endDate: dailyDetailEndDate,
						token,
						eventName,
						viewCode,
					};
				}
				setData(await api.getPostbackEvents(params));
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
				open={eventVisible}
				onCancel={handleModalClose}
				footer={null}
				width="100vw"
				style={{ top: 10 }}
				bodyStyle={{ overflow: 'auto', height: '87vh' }}
				className="table-modal"
			>
				<EventTable data={data} titleRef={titleRef} />
			</Modal>
		);
	},
);

export default EventModal;
