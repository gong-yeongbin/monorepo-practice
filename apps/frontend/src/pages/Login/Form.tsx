import React from 'react';
import { Form, Input, Button } from 'antd';
import { observer } from 'mobx-react';
import { LoadingOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';

const maxLength = 20;

const LoginForm = observer(
	(props: {
		loading: boolean;
		onSubmit: (data: { id: string; password: string }) => Promise<void>;
	}) => {
		const { loading, onSubmit } = props;

		return (
			<Form onFinish={onSubmit} method="POST" id="login-form">
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
		);
	},
);

export default LoginForm;
