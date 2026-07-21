import { DatePicker, Input } from 'antd';
import styled from 'styled-components';

export const StyledDatePicker = styled(DatePicker)`
	margin-bottom: 1rem;
`;
export const NameSearchBar = styled(Input)`
	width: 60%;
	height: 80%;
	margin-left: 0.5rem;
	border-width: 0.5px;
	border-radius: 30rem;
	& .ant-input {
		font-size: 0.8rem;
	}
	& .ant-input-clear-icon {
		padding-top: 1.5px;
	}
`;
export const PlatformHeader = styled.button`
	display: flex;
	gap: 0.3rem;
	background: none;
	border: none;
	cursor: pointer;
	padding-right: 0.4rem;
`;
