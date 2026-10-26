// 매체 추가 폼 — 매체가 준 포스트백 URL 원문의 {플레이스홀더}를 우리 키로 바꿔 저장한다
import React, { useState } from 'react';
import { Button, Form, Input, Select, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { api } from '@/shared/api/api';
import { applyPlaceholderMapping, extractPlaceholders, MEDIA_POSTBACK_KEYS } from '@/shared/lib/media-postback-template';
import { FormSection, MappingRow, PlaceholderLabel, Preview } from '@/features/developer/media-form.styles';

interface MediaFormValues {
	name: string;
	installUrl: string;
	eventUrl: string;
}

const KEY_OPTIONS = [
	{ value: '', label: '없음 (빈값으로 전송)' },
	...MEDIA_POSTBACK_KEYS.map(key => ({ value: key, label: key })),
];

const isOurKey = (name: string) => (MEDIA_POSTBACK_KEYS as readonly string[]).includes(name);

const MediaForm = () => {
	const queryClient = useQueryClient();
	const [form] = Form.useForm<MediaFormValues>();
	const installUrl = Form.useWatch('installUrl', form) ?? '';
	const eventUrl = Form.useWatch('eventUrl', form) ?? '';

	// 사용자가 고른 매핑만 담는다. 이름이 우리 키와 같은 자리는 안 골라도 그 키로 본다
	const [picked, setPicked] = useState<Record<string, string>>({});
	const placeholders = extractPlaceholders(`${installUrl} ${eventUrl}`);
	const mapping = Object.fromEntries(placeholders.map(name => [name, picked[name] ?? (isOurKey(name) ? name : '')]));

	const mutation = useMutation({
		mutationFn: api.createMedia,
		onSuccess: () => {
			message.success('매체를 추가했습니다.');
			queryClient.invalidateQueries({ queryKey: ['media'] });
			form.resetFields();
			setPicked({});
		},
		onError: error => {
			message.error(axios.isAxiosError(error) && error.response?.status === 409 ? '이미 있는 매체명입니다' : '저장에 실패했습니다');
		},
	});

	const submit = (values: MediaFormValues) => {
		mutation.mutate({
			name: values.name,
			install_postback_url: applyPlaceholderMapping(values.installUrl, mapping),
			event_postback_url: applyPlaceholderMapping(values.eventUrl, mapping),
		});
	};

	return (
		<FormSection>
			<Form form={form} layout="vertical" onFinish={submit}>
				<Form.Item label="매체명" name="name" rules={[{ required: true, message: '매체명을 입력하세요' }, { max: 30 }]}>
					<Input />
				</Form.Item>
				<Form.Item label="인스톨 URL" name="installUrl" rules={[{ required: true, message: '인스톨 URL을 입력하세요' }]}>
					<Input.TextArea rows={2} placeholder="매체가 준 URL을 그대로 붙여 넣으세요" />
				</Form.Item>
				<Form.Item label="이벤트 URL" name="eventUrl" rules={[{ required: true, message: '이벤트 URL을 입력하세요' }]}>
					<Input.TextArea rows={2} placeholder="매체가 준 URL을 그대로 붙여 넣으세요" />
				</Form.Item>

				{placeholders.length > 0 && (
					<Form.Item label="플레이스홀더 매핑">
						{placeholders.map(name => (
							<MappingRow key={name}>
								<PlaceholderLabel>{`{${name}}`}</PlaceholderLabel>
								<Select
									style={{ width: '24rem' }}
									value={mapping[name]}
									options={KEY_OPTIONS}
									onChange={value => setPicked(prev => ({ ...prev, [name]: value }))}
								/>
							</MappingRow>
						))}
					</Form.Item>
				)}

				{placeholders.length > 0 && (
					<Form.Item label="저장될 템플릿">
						<Preview>{applyPlaceholderMapping(installUrl, mapping)}</Preview>
						<Preview>{applyPlaceholderMapping(eventUrl, mapping)}</Preview>
					</Form.Item>
				)}

				<Button type="primary" htmlType="submit" loading={mutation.isPending}>
					저장
				</Button>
			</Form>
		</FormSection>
	);
};

export default MediaForm;
