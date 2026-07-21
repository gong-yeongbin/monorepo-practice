import { Avatar, Layout, Select, Skeleton } from 'antd';
import styled from 'styled-components';

const { Header, Content, Footer } = Layout;

export const StyledHeader = styled(Header)`
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
`;
export const LogoAndMenu = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;
export const Logo = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-width: 11rem;
	height: 100%;
	margin-right: 1rem;
	cursor: pointer;
`;
export const StyledSelect = styled(Select)`
	position: absolute;
	left: 50%;
	width: 35vw;
	transform: translateX(-50%);
	@media (max-width: 800px) {
		left: 70%;
	}
	@media (max-width: 550px) {
		width: 30vw;
	}
	@media (max-width: 485px) {
		display: none;
	}
`;
export const SkeletonSelect = styled(Skeleton.Input)`
	position: absolute;
	left: 50%;
	bottom: 0.7rem;
	width: 35vw;
	transform: translateX(-50%);
	@media (max-width: 800px) {
		left: 65%;
	}
	@media (max-width: 550px) {
		width: 30vw;
	}
	@media (max-width: 485px) {
		display: none;
	}
`;
export const UserProfile = styled(Avatar)`
	user-select: none;
`;
export const Title = styled.div`
	padding: 0.1em 0.5em;
	font-size: 1.4rem;
	color: #fff;
`;
export const SubTitle = styled.span`
	color: var(--grey);
	font-size: 0.7rem;
`;
export const ProfileContainer = styled.div``;
export const ProfileContents = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;
export const StyledContent = styled(Content)`
	margin: 0 1rem;
	padding: 1rem;
	background: #fff;
	overflow: auto;
`;
export const StyledFooter = styled(Footer)`
	padding: 1rem;
	font-size: 0.7rem;
	text-align: center;
`;
