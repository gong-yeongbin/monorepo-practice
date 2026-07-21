import styled from 'styled-components';

export const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	background-color: var(--light-grey);
`;
export const FormContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 20rem;
	padding: 0 2rem;
	padding-top: 2.5rem;
	padding-bottom: 1rem;
	margin-bottom: 15rem;
	background-color: #fff;
	border-radius: 10px;
	box-shadow: 3px 5px 15px -2px #a0a0a0;
`;
export const Title = styled.p`
	padding: 0.5rem 0;
	color: var(--grey);
	font-size: 1.1rem;
	user-select: none;
`;
