import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useQuery } from 'react-query';
import Amplify, { Auth } from 'aws-amplify';
import { axiosInstance } from '../../axios';
import { useStore } from '../../store';
import { Wrapper, TitleWrapper, Title, ContentsWrapper, Section, StyledForm } from './styles';
import { api } from '../../api';
import SelectOptions from '../../components/SelectOptions';

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
			aws_cognito_region: process.env.REACT_APP_REGION,
			Auth: {
				region: process.env.REACT_APP_REGION,
				userPoolId:
					listType === 'advertiser'
						? process.env.REACT_APP_USER_POOL_ID_ADVERTISER
						: process.env.REACT_APP_USER_POOL_ID_PARTNER,
				userPoolWebClientId:
					listType === 'advertiser'
						? process.env.REACT_APP_USER_POOL_CLIENT_ID_ADVERTISER
						: process.env.REACT_APP_USER_POOL_CLIENT_ID_PARTNER,
			},
		});
	}, [listType]);

	const { isFetching, data } = useQuery(
		['developer', { listType }],
		() => api.getDeveloperList(listType),
		{
			onError: () => {
				sessionStorage.clear();
				navigate('/login');
			},
		},
	);

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
			const { user: cognitoUser } = await Auth.signUp({
				username: id,
				password,
				attributes: { name: id },
			});
			if (cognitoUser) {
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
