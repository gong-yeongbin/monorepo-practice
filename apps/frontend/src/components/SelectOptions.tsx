import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

export default function SelectOptions(item: { idx: string; name: string }) {
	const { idx, name } = item;
	return (
		<Option key={idx} value={idx}>
			{name}
		</Option>
	);
}
