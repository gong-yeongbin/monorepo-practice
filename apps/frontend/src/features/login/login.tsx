import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Form, Input, Button, Avatar, message } from 'antd';
import { observer } from 'mobx-react';
import { LoadingOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Container, FormContainer, LinkRow, Title } from '@/features/login/login.styles';
import logo from '@/images/logo.png';

const maxLength = 20;
const emailMaxLength = 50;

const Login = observer(() => {
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		const accessToken = sessionStorage.getItem('accessToken');
		if (accessToken) {
			navigate('/');
		}
	}, []);

	const onLogin = async (data: { email: string; password: string }) => {
		try {
			setLoading(true);
			const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/signin`, data);
			setAccessToken(response);
		} catch (error: unknown) {
			setLoading(false);
			if (error instanceof Error && error.message.includes('401')) {
				message.error('이메일과 비밀번호를 확인해주세요.');
			} else if (error instanceof Error && error.message.includes('403')) {
				message.error('관리자 승인 대기 중인 계정입니다.');
			} else {
				message.error('잠시 후 다시 시도해주세요.');
			}
		}
	};

	const setAccessToken = (response: {
		data: {
			data: { access_token: string; refresh_token: string };
		};
	}) => {
		const accessToken = response.data.data.access_token;
		sessionStorage.setItem('accessToken', accessToken);
		sessionStorage.setItem('refreshToken', response.data.data.refresh_token);
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
					<Form.Item
						name="email"
						rules={[
							{ required: true, message: '이메일을 입력해주세요.' },
							{ type: 'email', message: '올바른 이메일 형식이 아닙니다.' },
						]}
					>
						<Input
							bordered={false}
							prefix={<UserOutlined />}
							placeholder="Email"
							maxLength={emailMaxLength}
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
				<LinkRow>
					<Link to="/signup">회원가입</Link>
				</LinkRow>
			</FormContainer>
		</Container>
	);
});

export default Login;
