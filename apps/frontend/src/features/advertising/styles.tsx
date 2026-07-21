import { Button, Row } from 'antd';
import styled, { keyframes } from 'styled-components';

interface IProps {
	$visible?: boolean | null;
	backgroundColor?: string | null;
}

const fadeIn = keyframes`
	from {
	  opacity: 0;
	}
	to {
		opacity: 1;
	}
	`;
const fadeOut = keyframes`
	from {
		opacity: 1;
	}
	to {
		opacity: 0;
	}
`;
export const PageContainer = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 1rem;
`;
export const ImageContainer = styled.span`
	display: inline-block;
	padding-right: 1rem;
`;
export const RowWithButtons = styled(Row)<IProps>`
	position: absolute;
	bottom: ${props => (props.$visible ? '-4rem' : '0rem')};
	width: 100%;
	animation: ${props => (props.$visible ? fadeIn : fadeOut)} 0.4s ease-out;
	transition: bottom 0.4s ease-out;
`;
export const AddButton = styled(Button)`
	width: 5rem;
	margin-right: 0.8rem;
`;
export const NewRow = styled(Row)<IProps>`
	visibility: ${props => (props.$visible ? 'visible' : 'hidden')};
	animation: ${props => (props.$visible ? fadeIn : fadeOut)} 0.4s ease-out;
	transition: visibility 0.4s ease-out;
`;
export const TextContent = styled.p`
	font-size: 1.2rem;
`;
export const BiggerOnHover = styled.div`
	padding: 0.3rem 0.7rem;
	cursor: pointer;
	&:hover {
		transform: scale(1.2);
	}
`;
export const UrlWrapper = styled.p`
	margin-top: -1.5rem;
	color: grey;
`;
export const URL = styled.span`
	word-break: break-all;
	.red {
		color: red;
	}
`;
