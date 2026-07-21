import React, { useRef, useState } from 'react';
import { Input, Form, Col, Button, message, Tooltip } from 'antd';
import { useNavigate } from 'react-router';
import { CaretUpOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useQueryClient } from 'react-query';
import { NewRow } from './styles';
import { axiosInstance } from '../../axios';

const NewAdvertiserForm = (props: {
	newVisible: boolean;
	setNewVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const { newVisible, setNewVisible } = props;

	const [disabledSubmit, setDisabledSubmit] = useState(true);

	const navigate = useNavigate();

	const [form] = Form.useForm();

	const inputRef = useRef<any>(null);

	const queryClient = useQueryClient();

	const handleNewAdd = async (e: React.MouseEvent) => {
		e.preventDefault();
		const name = form.getFieldValue('newAdvertiser');
		try {
			await axiosInstance.put(`/advertiser?name=${name}`);
			queryClient.invalidateQueries('advertisers');
			form.resetFields();
			setNewVisible(false);
			message.success('추가되었습니다.');
		} catch (error: unknown) {
			if (error instanceof Error && error.message.includes('409')) {
				message.error('동일한 광고주명이 존재합니다.');
				inputRef.current.focus({
					cursor: 'all',
				});
			} else {
				sessionStorage.clear();
				navigate('/login');
			}
		}
	};

	const handleNewCancel = () => {
		setNewVisible(false);
		form.resetFields();
	};

	const handleFormChange = () => {
		setDisabledSubmit(true);
		const newAdvertiser = form.getFieldValue('newAdvertiser');
		if (newAdvertiser) {
			setDisabledSubmit(false);
		}
	};

	return (
		<NewRow gutter={16} $visible={newVisible}>
			<Col span={24}>
				<Form form={form} onValuesChange={handleFormChange}>
					<Form.Item
						name="newAdvertiser"
						label="신규 광고주 추가"
						rules={[{ required: true, message: '입력해주세요.' }]}
					>
						<div style={{ display: 'flex', justifyContent: 'space-between' }}>
							<Input placeholder="광고주명" ref={inputRef} style={{ width: '70%' }} />
							<div>
								<Tooltip title="추가" color="var(--grey)">
									<Button
										type="text"
										htmlType="submit"
										disabled={disabledSubmit}
										onClick={handleNewAdd}
									>
										<PlusCircleOutlined />
									</Button>
								</Tooltip>
								<Tooltip title="취소" color="var(--grey)">
									<Button type="text" onClick={handleNewCancel} style={{ marginLeft: '0.5rem' }}>
										<CaretUpOutlined />
									</Button>
								</Tooltip>
							</div>
						</div>
					</Form.Item>
				</Form>
			</Col>
		</NewRow>
	);
};

export default NewAdvertiserForm;
