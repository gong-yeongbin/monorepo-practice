import React, { useEffect, useState } from 'react';
import {
	Form,
	Input,
	Button,
	DatePicker,
	TimePicker,
	Descriptions,
	Popconfirm,
	message,
	Modal,
} from 'antd';
import moment, { Moment } from 'moment';
import { useNavigate, useParams } from 'react-router';
import { useStore } from '../../../store';
import InfoCard from '../../../components/InfoCard';
import { Container, ButtonWrapper, MainWrapper, DateWrapper } from './styles';
import SelectableTable, { IColumns as ICreated } from './SelectableTable';
import ReservedTable, { IColumns as IReserved } from './ReservedTable';
import { axiosInstance } from '../../../axios';

const today = moment().format('YYYY-MM-DD');

const Change = () => {
	const [showUrlModal, setShowUrlModal] = useState(false);
	const [URL, setURL] = useState('');
	const [loadingCreated, setLoadingCreated] = useState(false);
	const [loadingReserved, setLoadingReserved] = useState(false);
	const [selectedDate, setSelectedDate] = useState(today);
	const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
	const [disabledSubmit, setDisabledSubmit] = useState(true);
	const [created, setCreated] = useState<Array<ICreated>>([]);
	const [reserved, setReserved] = useState<Array<IReserved>>([]);

	const [form] = Form.useForm();

	const navigate = useNavigate();

	const { id: paramId } = useParams();

	const store = useStore();

	useEffect(() => {
		store.setPageTitle('상위 트래커 URL 예약 변경');
		getCreated();
		getReserved();
	}, []);

	useEffect(() => {
		getDisabledHours();
	}, [selectedDate]);

	useEffect(() => {
		form.setFieldsValue({ campaigns: selectedRows });
		handleFormChange();
	}, [selectedRows]);

	const getCreated = async () => {
		try {
			setLoadingCreated(true);
			const res = await axiosInstance.get(`/reservation/on/${paramId}`);
			setCreated(res.data.data);
		} catch (error: unknown) {
			handleErrors(error);
		}
		setLoadingCreated(false);
	};

	const getReserved = async () => {
		try {
			setLoadingReserved(true);
			const res = await axiosInstance.get(`/reservation/off/${paramId}`);
			setReserved(res.data.data);
		} catch (error: unknown) {
			handleErrors(error);
		}
		setLoadingReserved(false);
	};

	const handleErrors = (error: unknown) => {
		if (error instanceof Error && error.message.includes('400')) {
			navigate('/');
		} else {
			sessionStorage.clear();
			navigate('/login');
		}
	};

	const handleFormChange = () => {
		setDisabledSubmit(true);
		const values = form.getFieldsValue();
		const { campaignName, trackingUrl, date, time, campaigns } = values;
		if (campaignName && trackingUrl && date && time && campaigns.length > 0) {
			setDisabledSubmit(false);
		}
	};

	const handleFormValues = () => {
		const values = form.getFieldsValue();
		const { campaignName, trackingUrl, time } = values;
		const formValues = {
			campaignName,
			trackingUrl,
			reservedAt: `${selectedDate} ${time.format('HH')}:00:00`,
			campaignIdx: selectedRows,
		};
		handleUpdate(formValues);
	};

	const handleUpdate = async (formValues: {
		campaignName: string;
		trackingUrl: string;
		reservedAt: string;
		campaignIdx: string[];
	}) => {
		try {
			await axiosInstance.put(`/reservation`, formValues);
			handleReset();
			await getReserved();
			message.success('예약을 설정했습니다.');
		} catch (error) {
			sessionStorage.clear();
			navigate('/login');
		}
	};

	const getDisabledDate = (current: Moment): boolean => {
		return moment().add(-1, 'days') >= current || moment().add(1, 'month') <= current;
	};

	const getDisabledHours = () => {
		const hours = [];
		if (selectedDate > today) {
			return [];
		}
		for (let i = 0; i <= moment().hour(); i++) {
			hours.push(i);
		}
		return hours;
	};

	const handleDateChange = (date: Moment | null, dateString: string) => {
		setSelectedDate(dateString);
	};

	const handleCancel = () => {
		navigate(`/${paramId}`);
	};

	const handleReset = () => {
		setDisabledSubmit(true);
		form.resetFields();
	};

	return (
		<Container>
			<InfoCard />

			<Modal
				title="Tracking URL"
				visible={showUrlModal}
				onCancel={() => setShowUrlModal(false)}
				footer={null}
				width="40vw"
				centered
			>
				{URL}
			</Modal>

			<Form
				id="change-form"
				form={form}
				initialValues={{
					date: moment(today, 'YYYY-MM-DD'),
					time: moment().add(1, 'hours'),
				}}
				onFieldsChange={handleFormChange}
				requiredMark={false}
				scrollToFirstError
				colon={false}
			>
				<MainWrapper>
					<div style={{ height: 'calc(var(--vh, 1vh) * 100 - 27rem)' }}>
						<Descriptions bordered>
							<Descriptions.Item label="변경 캠페인명" span={3} style={{ height: '1rem' }}>
								<Form.Item
									name="campaignName"
									rules={[
										{
											required: true,
											message: '입력해주세요.',
										},
									]}
								>
									<Input />
								</Form.Item>
							</Descriptions.Item>
							<Descriptions.Item label="변경 트랙킹 URL" span={3} style={{ height: '1rem' }}>
								<Form.Item
									name="trackingUrl"
									rules={[
										{
											required: true,
											message: '입력해주세요.',
										},
									]}
								>
									<Input />
								</Form.Item>
							</Descriptions.Item>
							<Descriptions.Item label="예약 날짜" span={3} style={{ height: '1rem' }}>
								<DateWrapper>
									<Form.Item name="date">
										<DatePicker
											placeholder="날짜 선택"
											allowClear={false}
											format="YYYY-MM-DD"
											style={{
												marginRight: '0.5rem',
												width: '11rem',
											}}
											disabledDate={getDisabledDate}
											onChange={handleDateChange}
										/>
									</Form.Item>
									<Form.Item name="time">
										<TimePicker
											placeholder="시간 선택"
											allowClear={false}
											style={{
												width: '11rem',
											}}
											format="HH:00"
											showNow={false}
											onSelect={selectedValue => form.setFieldsValue({ time: selectedValue })}
											disabledHours={getDisabledHours}
										/>
									</Form.Item>
								</DateWrapper>
							</Descriptions.Item>
							<Descriptions.Item label="변경 캠페인">
								<Form.Item
									style={{ height: '100%' }}
									name="campaigns"
									rules={[
										{
											required: true,
											message: '변경할 캠페인을 선택해주세요.',
										},
									]}
								>
									<SelectableTable
										setShowUrlModal={setShowUrlModal}
										setURL={setURL}
										setSelectedRows={setSelectedRows}
										loading={loadingCreated}
										data={created}
									/>
								</Form.Item>
							</Descriptions.Item>
						</Descriptions>{' '}
					</div>

					<ReservedTable
						setShowUrlModal={setShowUrlModal}
						setURL={setURL}
						getReserved={getReserved}
						loading={loadingReserved}
						setLoading={setLoadingReserved}
						data={reserved}
					/>
				</MainWrapper>
				<ButtonWrapper>
					<Popconfirm
						title="예약을 설정합니다."
						onConfirm={handleFormValues}
						okText="Yes"
						cancelText="No"
					>
						<Button
							type="primary"
							htmlType="submit"
							style={{ width: '5rem', marginRight: '0.8rem' }}
							disabled={disabledSubmit}
						>
							확인
						</Button>
					</Popconfirm>
					<Button
						htmlType="button"
						onClick={handleCancel}
						style={{ width: '5rem', marginRight: '0.8rem' }}
					>
						취소
					</Button>
					<Button htmlType="button" onClick={handleReset} style={{ width: '5rem' }}>
						초기화
					</Button>
				</ButtonWrapper>
			</Form>
		</Container>
	);
};

export default Change;
