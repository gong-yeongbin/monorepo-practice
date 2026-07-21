import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Form, Input, Button, Avatar, message } from 'antd';
import { observer } from 'mobx-react';
import { LoadingOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Container, FormContainer, Title } from './Login.style';
import logo from '../../images/logo.png';

const maxLength = 20;

const Login = observer(() => {
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		const accessToken = sessionStorage.getItem('accessToken');
		if (accessToken) {
			navigate('/');
		}
	}, []);

	const onLogin = async (data: { id: string; password: string }) => {
		try {
			setLoading(true);
			const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, data);
			setAccessToken(response);
		} catch (error: unknown) {
			setLoading(false);
			if (error instanceof Error && error.message.includes('401')) {
				message.error('아이디와 비밀번호를 확인해주세요.');
			} else {
				message.error('잠시 후 다시 시도해주세요.');
			}
		}
	};

	const setAccessToken = (response: {
		data: {
			data: { accessToken: string };
			_meta: { id: string; password: string };
		};
	}) => {
		const { accessToken } = response.data.data;
		sessionStorage.setItem('accessToken', accessToken);
		if (accessToken !== '') {
			navigate('/', { replace: true });
		}
	};

	return (
		<Container>
			<FormContainer>
				<Avatar size="large" src={logo} />
				<Title>Mecross Pro</Title>
				<Form onFinish={onLogin} method="POST" id="login-form">
					<Form.Item name="id" rules={[{ required: true, message: 'ID를 입력해주세요.' }]}>
						<Input
							bordered={false}
							prefix={<UserOutlined />}
							placeholder="ID"
							maxLength={maxLength}
						/>
					</Form.Item>

					<Form.Item
						name="password"
						rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
					>
						<Input
							bordered={false}
							prefix={<LockOutlined />}
							type="password"
							placeholder="Password"
							maxLength={maxLength}
						/>
					</Form.Item>

					<Form.Item>
						<Button type="primary" htmlType="submit">
							{loading ? <LoadingOutlined /> : 'Login'}
						</Button>
					</Form.Item>
				</Form>
			</FormContainer>
		</Container>
	);
});

export default Login;
