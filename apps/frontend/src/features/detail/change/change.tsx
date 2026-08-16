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
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/app/store';
import InfoCard from '@/shared/ui/info-card/info-card';
import { Container, ButtonWrapper, MainWrapper, DateWrapper } from '@/features/detail/change/change.styles';
import SelectableTable from '@/features/detail/change/selectable-table';
import ReservedTable from '@/features/detail/change/reserved-table';
import { axiosInstance } from '@/shared/api/axios';
import { api } from '@/shared/api/api';

const today = dayjs().format('YYYY-MM-DD');

const Change = () => {
	const [showUrlModal, setShowUrlModal] = useState(false);
	const [URL, setURL] = useState('');
	const [selectedDate, setSelectedDate] = useState(today);
	const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
	const [disabledSubmit, setDisabledSubmit] = useState(true);

	const [form] = Form.useForm();

	const navigate = useNavigate();

	const { id: paramId } = useParams();

	const store = useStore();

	const queryClient = useQueryClient();

	// 변경 캠페인 영역 — 해당 advertising의 campaign 전체 목록
	const { data: campaigns } = useQuery({
		queryKey: ['campaignList'],
		queryFn: () => api.getCampaigns(paramId),
	});

	// 예약 목록 — 해당 advertising의 캠페인에 걸린 예약 전체
	const { data: reserved, refetch: refetchReserved } = useQuery({
		queryKey: ['reservations', paramId],
		queryFn: () => api.getReservations(paramId),
	});

	useEffect(() => {
		store.setPageTitle('상위 트래커 URL 예약 변경');
	}, []);

	useEffect(() => {
		getDisabledHours();
	}, [selectedDate]);

	useEffect(() => {
		form.setFieldsValue({ campaigns: selectedRows });
		handleFormChange();
	}, [selectedRows]);

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
			name: campaignName,
			tracking_url: trackingUrl,
			reserved_at: `${selectedDate} ${time.format('HH')}:00:00`,
			campaign_ids: selectedRows.map(Number),
		};
		handleCreate(formValues);
	};

	const handleCreate = async (formValues: {
		name: string;
		tracking_url: string;
		reserved_at: string;
		campaign_ids: number[];
	}) => {
		try {
			await axiosInstance.post(`/reservations`, formValues);
			handleReset();
			await queryClient.invalidateQueries({ queryKey: ['reservations'] });
			message.success('예약을 설정했습니다.');
		} catch (error) {
			message.error('예약 설정에 실패했습니다.');
		}
	};

	const getDisabledDate = (current: Dayjs): boolean => {
		return dayjs().add(-1, 'days') >= current || dayjs().add(1, 'month') <= current;
	};

	const getDisabledHours = () => {
		const hours = [];
		if (selectedDate > today) {
			return [];
		}
		for (let i = 0; i <= dayjs().hour(); i++) {
			hours.push(i);
		}
		return hours;
	};

	const handleDateChange = (date: Dayjs | null, dateString: string | string[] | null) => {
		setSelectedDate(Array.isArray(dateString) ? dateString[0] : dateString ?? '');
	};

	const handleCancel = () => {
		navigate(`/advertising/${paramId}`);
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
				open={showUrlModal}
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
					date: dayjs(today, 'YYYY-MM-DD'),
					time: dayjs().add(1, 'hours'),
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
										data={campaigns ?? []}
									/>
								</Form.Item>
							</Descriptions.Item>
						</Descriptions>{' '}
					</div>

					<ReservedTable
						setShowUrlModal={setShowUrlModal}
						setURL={setURL}
						getReserved={refetchReserved}
						data={reserved ?? []}
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
