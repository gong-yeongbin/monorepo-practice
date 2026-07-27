import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { observer } from 'mobx-react';
import {
	Select,
	Input,
	Drawer,
	Form,
	Col,
	Row,
	Popconfirm,
	Button,
	Radio,
	Upload,
	message,
} from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CaretDownOutlined, PlusOutlined } from '@ant-design/icons';
import { axiosInstance } from '@/shared/api/axios';
import NewAdvertiserForm from '@/features/advertising/new-advertiser-form';
import { AddButton, RowWithButtons } from '@/features/advertising/advertising.styles';
import { ButtonWrapper } from '@/features/detail/change/change.styles';
import { api } from '@/shared/api/api';
import SelectOptions from '@/shared/ui/select-options';

const AdvertiserForm = observer(
	(props: {
		drawerVisible: boolean;
		setDrawerVisible: React.Dispatch<React.SetStateAction<boolean>>;
	}) => {
		const { drawerVisible, setDrawerVisible } = props;

		const [newVisible, setNewVisible] = useState(false);
		const [disabledSubmit, setDisabledSubmit] = useState(true);
		const [selectedFile, setSelectedFile] = useState<any>(null);
		const [imageURL, setImageURL] = useState('');

		const navigate = useNavigate();

		const [form] = Form.useForm();

		const queryClient = useQueryClient();

		useEffect(() => {
			if (selectedFile) {
				let newImageURL = '';
				newImageURL = URL.createObjectURL(selectedFile);
				setImageURL(newImageURL);
			}
		}, [selectedFile]);

		const { data: trackers } = useQuery({
			queryKey: ['trackers'],
			queryFn: api.getTrackers,
			enabled: !!drawerVisible,
		});

		const { data: advertisers } = useQuery({
			queryKey: ['advertisers'],
			queryFn: api.getAdvertisers,
			enabled: !!drawerVisible,
		});

		const validateForm = () => {
			setDisabledSubmit(true);
			const values = form.getFieldsValue();
			// 이미지 파일 업로드 endpoint가 backend에 없어 이미지는 필수값에서 제외한다
			const { platform, advertisingName, trackerIdx, advertiserIdx } = values;
			if (platform && advertisingName && trackerIdx && advertiserIdx) {
				setDisabledSubmit(false);
			}
		};

		const handleFormValues = () => {
			const { platform, advertisingName, trackerIdx, advertiserIdx } = form.getFieldsValue();
			handleSubmit({
				name: `${advertisingName} (${platform})`,
				advertiser_id: Number(advertiserIdx),
				tracker_id: Number(trackerIdx),
			});
		};

		const handleSubmit = async (body: { name: string; advertiser_id: number; tracker_id: number }) => {
			try {
				await axiosInstance.post(`/advertising`, body);
				handleReset();
				setDrawerVisible(false);
				queryClient.invalidateQueries({ queryKey: ['advertising'] });
				message.success('등록되었습니다.');
			} catch (error) {
				sessionStorage.clear();
				navigate('/login');
			}
		};

		const closeDrawer = () => {
			setDrawerVisible(false);
			setNewVisible(false);
			handleReset();
		};

		const handleReset = () => {
			setDisabledSubmit(true);
			form.resetFields();
			handleImageRemove();
		};

		const handleImageRemove = () => {
			setSelectedFile(null);
			setImageURL('');
			URL.revokeObjectURL(selectedFile);
		};

		const openNewAdvertiserAddForm = () => {
			setNewVisible(true);
		};

		const uploadProps = {
			beforeUpload: () => {
				return false;
			},
			onChange: (info: { file: any }) => {
				setSelectedFile(info.file);
			},
		};

		return (
			<Drawer
				title="광고 등록"
				onClose={closeDrawer}
				open={drawerVisible && trackers && advertisers}
			>
				<Form
					id="advertising-add-form"
					form={form}
					onValuesChange={validateForm}
					layout="vertical"
					requiredMark={false}
					scrollToFirstError
					colon={false}
					style={{ position: 'relative' }}
				>
					<Row gutter={16}>
						<Col span={24}>
							<Form.Item name="image" label="광고 이미지 업로드">
								<Upload
									{...uploadProps}
									showUploadList={false}
									accept="image/*"
									listType="picture-card"
								>
									{imageURL === '' ? (
										<div>
											<PlusOutlined />
											<div style={{ marginTop: 8 }}>Upload</div>
										</div>
									) : (
										<img src={imageURL} alt="ad" style={{ width: '100%' }} />
									)}
								</Upload>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col span={24}>
							<Form.Item
								name="platform"
								label="플랫폼"
								rules={[{ required: true, message: '선택해주세요.' }]}
							>
								<Radio.Group>
									<Radio value="AOS">AOS</Radio>
									<Radio value="iOS">iOS</Radio>
								</Radio.Group>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col span={24}>
							<Form.Item
								name="advertisingName"
								label="광고명"
								rules={[{ required: true, message: '입력해주세요.' }]}
							>
								<Input allowClear />
							</Form.Item>
						</Col>
					</Row>

					{trackers && (
						<Row gutter={16}>
							<Col span={24}>
								<Form.Item
									name="trackerIdx"
									label="트래커"
									rules={[{ required: true, message: '선택해주세요.' }]}
								>
									<Select placeholder="트래커 선택">{trackers.map(SelectOptions)}</Select>
								</Form.Item>
							</Col>
						</Row>
					)}

					{advertisers && (
						<Row gutter={16}>
							<Col span={12}>
								<Form.Item
									name="advertiserIdx"
									label="광고주"
									rules={[{ required: true, message: '선택해주세요.' }]}
								>
									<Select placeholder="광고주 선택">{advertisers.map(SelectOptions)}</Select>
								</Form.Item>
							</Col>
							{!newVisible && (
								<Col span={12} id="new-button">
									<Form.Item label="신규 광고주 추가 버튼">
										<Button type="primary" onClick={openNewAdvertiserAddForm}>
											<CaretDownOutlined />
											신규 광고주 추가
										</Button>
									</Form.Item>
								</Col>
							)}
						</Row>
					)}
					<NewAdvertiserForm newVisible={newVisible} setNewVisible={setNewVisible} />

					<RowWithButtons gutter={16} $visible={newVisible}>
						<Col span={24}>
							<ButtonWrapper>
								<Popconfirm
									title="광고를 등록합니다."
									onConfirm={handleFormValues}
									okText="Yes"
									cancelText="No"
								>
									<Form.Item>
										<AddButton type="primary" htmlType="submit" disabled={disabledSubmit}>
											등록
										</AddButton>
									</Form.Item>
								</Popconfirm>
								<Button htmlType="button" onClick={handleReset} style={{ width: '5rem' }}>
									초기화
								</Button>
							</ButtonWrapper>
						</Col>
					</RowWithButtons>
				</Form>
			</Drawer>
		);
	},
);

export default AdvertiserForm;
