import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { observer } from 'mobx-react';
import { Select, Input, Drawer, Form, Col, Row, Popconfirm, Button, Radio, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/shared/api/axios';
import { useStore } from '@/app/store';
import { TextContent, URL, UrlWrapper } from '@/features/advertising/advertising.styles';
import { ButtonWrapper } from '@/features/detail/change/change.styles';
import SelectOptions from '@/shared/ui/select-options';

enum appKeyExamples {
	adjust = `https://app.adjust.com/<span class="red">{AppKey}</span>?install_callback=http%3A%2F%2Fad.mecross.net%2FadjustIp.php%3F...`,
	adbrixremaster = `https://<span class="red">{AppKey}</span>.adtouch.adbrix.io/api/v1/click/CbrALx234kWCcc1707Ue2Q?m_adid...`,
	appsflyer = `https://app.appsflyer.com/<span class="red">{AppKey}</span>?af_prt=makeulike2&pid=mecross_int&af_click_lookback=7d...`,
	singular = `https://singularassist.sng.link/D59c0/<span class="red">{AppKey}</span>?idfa={idfa}&...`,
}

interface IMedia {
	idx: string;
	name: string;
}

const CampaignForm = observer(
	(props: {
		drawerVisible: boolean;
		setDrawerVisible: React.Dispatch<React.SetStateAction<boolean>>;
	}) => {
		const { drawerVisible, setDrawerVisible } = props;

		const [loading, setLoading] = useState(true);
		const [disabledSubmit, setDisabledSubmit] = useState(true);
		const [media, setMedia] = useState<Array<IMedia>>([]);
		const [filteredMedia, setFilteredMedia] = useState<Array<IMedia>>([]);
		const [urlWithAppKey, setUrlWithAppKey] = useState('');

		const navigate = useNavigate();

		const { id: paramId } = useParams<{ id: string }>();

		const [form] = Form.useForm();

		const store = useStore();
		const { info } = store;

		const trackingUrlRef = useRef<any>(null);

		const queryClient = useQueryClient();

		useEffect(() => {
			getMedia();
		}, []);

		useEffect(() => {
			if (
				media.length > 0 &&
				filteredMedia.length > 0 &&
				info.tracker !== '' &&
				urlWithAppKey !== ''
			) {
				setLoading(false);
			}
		}, [drawerVisible]);

		useEffect(() => {
			showAppKeyExample();
		}, [info.tracker]);

		const showAppKeyExample = () => {
			const asArray = Object.entries(appKeyExamples);
			const filtered = asArray.filter(([key, value]) => key === info.tracker);
			if (filtered.length > 0) {
				const justStrings = Object.fromEntries(filtered);
				setUrlWithAppKey(Object.values(justStrings).toString());
			} else {
				setUrlWithAppKey('noAppKey');
			}
		};

		const getMedia = async () => {
			try {
				const res = await axiosInstance.get(`/media`);
				setMedia(res.data.data);
				setFilteredMedia(res.data.data);
			} catch (error) {
				sessionStorage.clear();
				navigate('/login');
			}
		};

		const onMediaSearch = (text: string) => {
			if (text === '') {
				showAllMedia();
				return;
			}
			const filtered = media.filter(item => item.name.includes(text));
			setFilteredMedia(filtered);
		};

		const handleFormChange = () => {
			setDisabledSubmit(true);
			const values = form.getFieldsValue();
			const { mediaIdx, campaignName, type, trackerTrackingUrl, appkey } = values;
			if (mediaIdx && campaignName && type && trackerTrackingUrl && appkey) {
				setDisabledSubmit(false);
			}
		};

		const handleFormValues = () => {
			const formValues = form.getFieldsValue();
			const { appkey, mediaIdx, campaignName, trackerTrackingUrl, type } = formValues;
			handleSubmit({
				advertisingIdx: paramId as string,
				appkey,
				mediaIdx,
				campaignName,
				trackerTrackingUrl,
				type,
			});
		};

		const handleSubmit = async (formValues: {
			advertisingIdx: string;
			appkey: string;
			mediaIdx: string;
			campaignName: string;
			trackerTrackingUrl: string;
			type: string;
		}) => {
			try {
				await axiosInstance.put(`/campaign`, formValues);
				handleReset();
				setDrawerVisible(false);
				queryClient.invalidateQueries({ queryKey: ['campaignList'] });
				message.success('등록되었습니다.');
			} catch (error) {
				if (error instanceof Error && error.message.includes('412')) {
					message.error('올바른 트래킹 URL을 입력해주세요.');
					trackingUrlRef.current.focus({
						cursor: 'all',
					});
				} else {
					sessionStorage.clear();
					navigate('/login');
				}
			}
		};

		const onDrawerClose = () => {
			setDrawerVisible(false);
			setDisabledSubmit(true);
			form.resetFields();
		};

		const handleReset = () => {
			setDisabledSubmit(true);
			form.resetFields();
		};

		const showAllMedia = () => {
			setFilteredMedia(media);
		};

		const onMediaOpenChange = (open: boolean) => {
			if (!open) {
				showAllMedia();
			}
		};

		return (
			<Drawer title="캠페인 등록" onClose={onDrawerClose} open={drawerVisible && !loading}>
				<Form
					id="campaign-add-form"
					form={form}
					onValuesChange={handleFormChange}
					layout="vertical"
					requiredMark={false}
					scrollToFirstError
					colon={false}
					initialValues={{ type: 'CPI' }}
				>
					<Row gutter={16}>
						<Col span={24}>
							<Form.Item name="mediaIdx" label="매체">
								<Select
									showSearch
									filterOption={false}
									placeholder="선택 또는 검색"
									onSearch={onMediaSearch}
									onDropdownVisibleChange={onMediaOpenChange}
								>
									{filteredMedia.map(SelectOptions)}
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col span={24}>
							<Form.Item name="advertising" label="광고앱">
								<TextContent>{info.advertising}</TextContent>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col span={24}>
							<Form.Item
								name="campaignName"
								label="캠페인명"
								rules={[{ required: true, message: '입력해주세요.' }]}
							>
								<Input allowClear />
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col span={24}>
							<Form.Item
								name="type"
								label="타입"
								rules={[{ required: true, message: '입력해주세요.' }]}
							>
								<Radio.Group>
									<Radio value="CPI">CPI</Radio>
									<Radio value="CPA">CPA</Radio>
								</Radio.Group>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col span={24}>
							<Form.Item
								name="tracker"
								label="트래커"
								rules={[{ required: true, message: '선택해주세요.' }]}
							>
								<TextContent>{info.tracker}</TextContent>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col span={24}>
							<Form.Item
								name="trackerTrackingUrl"
								label="트래커 트래킹 URL"
								rules={[{ required: true, message: '입력해주세요.' }]}
							>
								<Input ref={trackingUrlRef} allowClear />
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col span={24}>
							<Form.Item
								name="appkey"
								label="앱 키"
								rules={[{ required: true, message: '입력해주세요.' }]}
							>
								<Input placeholder="트래커 트래킹 URL의 app key를 입력해주세요" allowClear />
							</Form.Item>
							{urlWithAppKey !== 'noAppKey' && (
								<UrlWrapper>
									<QuestionCircleOutlined />
									<URL
										dangerouslySetInnerHTML={{
											__html: ` ${urlWithAppKey}`,
										}}
									/>
								</UrlWrapper>
							)}
						</Col>
					</Row>

					<Row gutter={16}>
						<Col span={24}>
							<ButtonWrapper>
								<Popconfirm
									title="캠페인을 등록합니다."
									onConfirm={handleFormValues}
									okText="Yes"
									cancelText="No"
								>
									<Form.Item>
										<Button
											type="primary"
											htmlType="submit"
											style={{ width: '5rem', marginRight: '0.8rem' }}
											disabled={disabledSubmit}
										>
											등록
										</Button>
									</Form.Item>
								</Popconfirm>
								<Button htmlType="button" onClick={handleReset} style={{ width: '5rem' }}>
									초기화
								</Button>
							</ButtonWrapper>
						</Col>
					</Row>
				</Form>
			</Drawer>
		);
	},
);

export default CampaignForm;
