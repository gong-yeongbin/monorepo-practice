import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { observer } from 'mobx-react';
import { LineChartOutlined, LockOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';
import {
	Button,
	Form,
	Input,
	message,
	Radio,
	RadioChangeEvent,
	Select,
	Skeleton,
	Switch,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import { Amplify } from 'aws-amplify';
import { signUp } from 'aws-amplify/auth';
import { axiosInstance } from '@/shared/api/axios';
import { useStore } from '@/app/store';
import { Wrapper, TitleWrapper, Title, ContentsWrapper, Section, StyledForm } from '@/features/developer/styles';
import { api } from '@/shared/api/api';
import SelectOptions from '@/shared/ui/SelectOptions';

const Developer = observer(() => {
	const [listType, setListType] = useState('advertiser');
	const [disabledSubmit, setDisabledSubmit] = useState(true);

	const store = useStore();

	const navigate = useNavigate();

	const [form] = Form.useForm();

	useEffect(() => {
		store.setPageTitle('개발자 메뉴');
	}, []);

	useEffect(() => {
		Amplify.configure({
			Auth: {
				Cognito: {
					userPoolId:
						listType === 'advertiser'
							? import.meta.env.VITE_USER_POOL_ID_ADVERTISER
							: import.meta.env.VITE_USER_POOL_ID_PARTNER,
					userPoolClientId:
						listType === 'advertiser'
							? import.meta.env.VITE_USER_POOL_CLIENT_ID_ADVERTISER
							: import.meta.env.VITE_USER_POOL_CLIENT_ID_PARTNER,
				},
			},
		});
	}, [listType]);

	const { isFetching, data } = useQuery({
		queryKey: ['developer', { listType }],
		queryFn: () => api.getDeveloperList(listType),
	});

	const handleRadioChange = (e: RadioChangeEvent) => {
		form.resetFields(['typeIdx']);
		setListType(e.target.value);
	};

	const handleFormChange = () => {
		setDisabledSubmit(true);
		const values = form.getFieldsValue();
		const { typeIdx, id, password } = values;
		if (typeIdx && id && password) {
			setDisabledSubmit(false);
		}
	};

	const handleSubmit = async (values: any) => {
		try {
			const { typeIdx, id, password } = values;
			const formValues = {
				typeIdx: parseInt(typeIdx, 10),
				id,
				password,
				type: listType,
			};
			const { userId: cognitoUserId } = await signUp({
				username: id,
				password,
				options: { userAttributes: { name: id } },
			});
			if (cognitoUserId) {
				await axiosInstance.post(`/user`, formValues);
				message.success('계정이 생성되었습니다.');
				form.resetFields();
			}
		} catch (error: unknown) {
			if (error instanceof Error && error.message === 'User already exists') {
				message.error('이미 존재하는 아이디입니다.');
			} else {
				sessionStorage.clear();
				navigate('/login');
			}
		}
	};

	return (
		<Wrapper>
			<Section>
				<TitleWrapper>
					<UserAddOutlined />
					<Title>계정 생성</Title>
				</TitleWrapper>

				<ContentsWrapper>
					<Radio.Group onChange={handleRadioChange} value={listType} style={{ margin: '1rem 0' }}>
						<Radio value="advertiser">광고주</Radio>
						<Radio value="media">매체</Radio>
					</Radio.Group>

					<StyledForm
						layout="inline"
						form={form}
						onFinish={handleSubmit}
						method="POST"
						id="developer-form"
						onValuesChange={handleFormChange}
					>
						<Form.Item name="typeIdx">
							{isFetching ? (
								<Skeleton.Input style={{ width: '10rem' }} active />
							) : (
								<Select
									style={{ width: '10rem' }}
									placeholder={listType === 'advertiser' ? '광고주' : '매체'}
									value={listType}
								>
									{data?.map(SelectOptions)}
								</Select>
							)}
						</Form.Item>

						<Form.Item
							name="id"
							rules={[{ required: true, message: '입력해주세요.' }]}
							style={{ width: '10rem' }}
						>
							<Input placeholder="ID" prefix={<UserOutlined />} />
						</Form.Item>

						<Form.Item
							name="password"
							rules={[
								{ required: true, message: '입력해주세요.' },
								{
									min: 6,
									message: '6자 이상으로 구성해주세요.',
								},
							]}
							style={{ width: '10rem' }}
						>
							<Input placeholder="password" prefix={<LockOutlined />} />
						</Form.Item>

						<Form.Item>
							<Button type="primary" htmlType="submit" disabled={disabledSubmit}>
								생성
							</Button>
						</Form.Item>
					</StyledForm>
				</ContentsWrapper>
			</Section>

			<Section>
				<TitleWrapper>
					<LineChartOutlined />
					<Title>
						Tracking Info <Switch defaultChecked size="small" style={{ marginLeft: '1rem' }} />
					</Title>
				</TitleWrapper>
			</Section>
		</Wrapper>
	);
});

export default Developer;
