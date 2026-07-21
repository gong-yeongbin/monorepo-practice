import { Avatar, Upload } from 'antd';
import styled from 'styled-components';

interface IProps {
	padding?: string | null;
	gridColumns?: string | null;
}

export const Container = styled.div<IProps>`
	display: grid;
	grid-template-columns: ${props => props.gridColumns || '1fr'};
	column-gap: 3rem;
	align-items: center;
	min-width: 300px;
	margin-bottom: 1rem;
	padding: ${props => props.padding || '1rem'};
	border: 1px solid var(--light-grey);
`;
export const DataContainer = styled.ul`
	display: flex;
	align-items: center;
`;
export const ImageContainer = styled.div`
	display: flex;
	justify-contents: center;
	align-items: center;
	padding-right: 1rem;
`;
export const InfoContainer = styled.ul`
	display: inline-block;
	display: flex;
	flex-direction: column;
`;
export const Title = styled.h1`
	margin: 0;
	padding-bottom: 0.5rem;
	font-size: 18px;
`;
export const Label = styled.span`
	font-weight: bold;
	user-select: none;
`;
export const UploadWrapper = styled.div`
	position: relative;
	overflow: hidden;
	width: 70px;
	height: 70px;
`;
export const StyledUpload = styled(Upload)`
	position: relative;
	.ant-upload-select-picture-card {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
`;
export const StyledAvatar = styled(Avatar)`
	border: 1px dashed transparent;
	border-radius: 20px;
	${StyledUpload}:hover & {
		border: 1px dashed var(--light-grey);
	}
`;
export const EditText = styled.label`
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	bottom: 0.7rem;
	left: 50%;
	transform: translateX(-50%);
	width: 97%;
	height: 1.7rem;
	padding: 0.4rem;
	border-radius: 0 0 20px 20px;
	color: #fff;
	overflow: hidden;
	backdrop-filter: contrast(40%);
	border: 1px solid transparent;
	cursor: pointer;
	z-index: 100;
	visibility: hidden;
	${StyledUpload}:hover & {
		visibility: visible;
	}
`;
