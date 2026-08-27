import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router';
import { Avatar, Layout, Breadcrumb } from 'antd';
import type { MenuProps } from 'antd';
import {
	ApartmentOutlined,
	SettingOutlined,
} from '@ant-design/icons';
import { observer } from 'mobx-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAd, faChartLine } from '@fortawesome/free-solid-svg-icons';
import debounce from 'debounce';
import {
	Logo,
	ProfileContainer,
	StyledHeader,
	SubTitle,
	Title,
	UserProfile,
	StyledFooter,
	LogoAndMenu,
	StyledContent,
	StyledMenu,
} from '@/features/home/home.styles';
import { useStore } from '@/app/store';
import { parseAccessToken } from '@/shared/lib/auth';
import logo from '@/images/logo.png';

const Home = observer(() => {
	const store = useStore();
	const { pageTitle, selectedMenu } = store;

	const navigate = useNavigate();

	const { pathname } = useLocation();

	const accessToken = sessionStorage.getItem('accessToken');

	useEffect(() => {
		if (!accessToken) {
			navigate('/login');
		}
	}, []);

	useEffect(() => {
		if (pathname.includes(`/advertising`)) {
			store.setSelectedMenu('advertising');
		} else if (pathname === `/media`) {
			store.setSelectedMenu('media');
		} else if (pathname === `/tracker`) {
			store.setSelectedMenu('tracker');
		} else if (pathname === `/developer`) {
			store.setSelectedMenu('developer');
		} else {
			store.setSelectedMenu('');
		}
	}, [pathname]);

	useEffect(() => {
		setMaxHeightForTables();
		window.addEventListener('resize', debounce(setMaxHeightForTables, 500));
		return () => {
			window.removeEventListener('resize', setMaxHeightForTables);
		};
	}, []);

	const setMaxHeightForTables = () => {
		const height = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${height}px`);
	};

	const handleLogout = () => {
		sessionStorage.clear();
		navigate('/login');
	};

	// 확인 시 로그아웃, 취소 시 세션 유지
	const handleLogoutClick = () => {
		if (window.confirm('로그아웃 하시겠습니까?')) {
			handleLogout();
		}
	};

	const user = parseAccessToken(accessToken);

	const forceReload = () => {
		navigate('/');
		window.location.reload();
	};

	const handleMenuClick = (menuEvent: { key: string }) => {
		const { key } = menuEvent;
		store.setSelectedMenu(key);
		navigate(`/${key}`);
	};

	// USER는 대시보드만 접근 가능하므로 운영 메뉴를 노출하지 않는다
	const menuItems: MenuProps['items'] =
		!user || user.role === 'USER'
			? []
			: [
					{
						label: '광고앱 관리',
						key: 'advertising',
						icon: <FontAwesomeIcon icon={faAd} />,
					},
					{
						label: '트래커 관리',
						key: 'tracker',
						icon: <FontAwesomeIcon icon={faChartLine} />,
					},
					{
						label: '매체 관리',
						key: 'media',
						icon: <ApartmentOutlined />,
					},
					...(user.role === 'DEVELOPER'
						? [
								{
									label: '개발자 메뉴',
									key: 'developer',
									icon: <SettingOutlined />,
								},
							]
						: []),
				];

	return (
		<Layout className="layout">
			<StyledHeader>
				<LogoAndMenu>
					<Logo onClick={forceReload}>
						<Avatar src={logo} />
						<Title>
							Mecross <SubTitle>Pro</SubTitle>
						</Title>
					</Logo>

					<StyledMenu
						id="menu-list"
						mode="horizontal"
						theme="dark"
						onClick={handleMenuClick}
						items={menuItems}
						selectedKeys={[selectedMenu]}
					/>
				</LogoAndMenu>

				<ProfileContainer>
					<UserProfile type="button" onClick={handleLogoutClick}>
						{user?.email}
					</UserProfile>
				</ProfileContainer>
			</StyledHeader>

			<Breadcrumb items={[{ title: pageTitle }]} />

			<StyledContent>
				<Outlet />
			</StyledContent>

			<StyledFooter>© 2021 OneTwoAd</StyledFooter>
		</Layout>
	);
});

export default Home;
