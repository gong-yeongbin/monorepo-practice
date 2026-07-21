import { Form } from 'antd';
import styled from 'styled-components';

export const Wrapper = styled.div`
	height: 100%;
	min-height: 20rem;
`;
export const TitleWrapper = styled.div`
	padding-left: 0.5rem;
	font-weight: 600;
`;
export const Section = styled.section`
	&:nth-child(n + 2) ${TitleWrapper} {
		margin-bottom: 1rem;
	}
`;
export const Title = styled.span`
	padding-left: 0.5rem;
	font-size: 1.2rem;
`;
export const ContentsWrapper = styled.div`
	margin-bottom: 3rem;
`;
export const StyledForm = styled(Form)`
	@media (max-width: 530px) {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
`;
