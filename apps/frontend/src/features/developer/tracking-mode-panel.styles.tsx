// 트래킹 모드 패널 스타일
import styled from 'styled-components';

export const PanelSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1.6rem;
	padding: 1.6rem 0.8rem;
	max-width: 60rem;
`;

export const PanelDescription = styled.p`
	margin: 0;
	color: rgba(0, 0, 0, 0.55);
	line-height: 1.6;
`;

export const RadioOptionDescription = styled.span`
	margin-left: 0.8rem;
	color: rgba(0, 0, 0, 0.45);
`;
