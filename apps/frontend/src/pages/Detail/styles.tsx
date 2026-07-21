import styled from 'styled-components';
import { Button, Form } from 'antd';

export const LoadingContents = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 1rem;
`;
export const ExcelButton = styled(Button)`
	display: flex;
	align-items: center;
	margin-left: 0.5rem;
`;
export const DropdownContainer = styled.div`
	background: #fff;
	box-shadow: 2px 4px 8px 1px #cad0c8;
`;
export const DropdownForm = styled(Form)`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 1rem;
`;
export const FileName = styled.span`
	padding-left: 1rem;
`;
