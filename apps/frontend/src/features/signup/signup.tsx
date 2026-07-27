// 이메일 인증 코드 기반 회원가입 화면 (코드 발송 → 코드 검증 2단계)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Form, Input, Button, Avatar, message } from 'antd';
import { LoadingOutlined, LockOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Container, FormContainer, LinkRow, Title } from '@/features/login/login.styles';
import logo from '@/images/logo.png';

const maxLength = 20;
const emailMaxLength = 50;
const codeLength = 6;

const Signup = () => {
	const [loading, setLoading] = useState(false);
	const [signupEmail, setSignupEmail] = useState('');

	const navigate = useNavigate();

	const onSignup = async (data: { email: string; password: string }) => {
		try {
			setLoading(true);
			await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, data);
			setSignupEmail(data.email);
			message.success('인증 코드를 이메일로 발송했습니다.');
		} catch (error: unknown) {
			if (error instanceof Error && error.message.includes('409')) {
				message.error('이미 가입된 이메일입니다.');
			} else {
				message.error('잠시 후 다시 시도해주세요.');
			}
		} finally {
			setLoading(false);
		}
	};

	const onVerify = async (data: { code: string }) => {
		try {
			setLoading(true);
			await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup/verify`, {
				email: signupEmail,
				code: data.code,
			});
			message.success('회원가입이 요청되었습니다. 관리자 승인 후 가입이 완료됩니다.');
			navigate('/login', { replace: true });
		} catch (error: unknown) {
			if (error instanceof Error && error.message.includes('400')) {
				message.error('인증 코드가 올바르지 않거나 만료되었습니다.');
			} else if (error instanceof Error && error.message.includes('409')) {
				message.error('이미 가입된 이메일입니다.');
			} else {
				message.error('잠시 후 다시 시도해주세요.');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container>
			<FormContainer>
				<Avatar size="large" src={logo} />
				<Title>Mecross Pro</Title>
				{signupEmail === '' ? (
					<Form onFinish={onSignup} method="POST" id="signup-form">
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
							rules={[
								{ required: true, message: '비밀번호를 입력해주세요.' },
								{ min: 8, message: '비밀번호는 8자 이상이어야 합니다.' },
							]}
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
								{loading ? <LoadingOutlined /> : '인증 코드 받기'}
							</Button>
						</Form.Item>
					</Form>
				) : (
					<Form onFinish={onVerify} method="POST" id="verify-form">
						<Form.Item
							name="code"
							rules={[
								{ required: true, message: '인증 코드를 입력해주세요.' },
								{ pattern: /^\d{6}$/, message: '6자리 숫자를 입력해주세요.' },
							]}
						>
							<Input
								bordered={false}
								prefix={<SafetyOutlined />}
								placeholder="인증 코드 6자리"
								maxLength={codeLength}
							/>
						</Form.Item>

						<Form.Item>
							<Button type="primary" htmlType="submit">
								{loading ? <LoadingOutlined /> : '코드 인증'}
							</Button>
						</Form.Item>
					</Form>
				)}
				<LinkRow>
					{signupEmail === '' ? (
						<Link to="/login">로그인으로 돌아가기</Link>
					) : (
						<Button type="link" size="small" onClick={() => setSignupEmail('')}>
							이메일 다시 입력
						</Button>
					)}
				</LinkRow>
			</FormContainer>
		</Container>
	);
};

export default Signup;
