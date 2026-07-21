import styled from 'styled-components';

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-width: 1100px;
	height: 100%;
`;
export const MainWrapper = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 0.5rem;
	overflow: auto;
`;
export const ButtonWrapper = styled.div`
	display: flex;
	justify-content: center;
	margin: 1rem;
`;
export const DateWrapper = styled.div`
	display: flex;
`;
export const ListWrapper = styled.div`
	height: 100%;
	border: 1px solid var(--light-grey);
	overflow: auto;
`;
