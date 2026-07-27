import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router';
import { Avatar, Layout, Breadcrumb, Popover, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
	ApartmentOutlined,
	HomeOutlined,
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
import logo from '@/images/logo.png';

// JWT access token payload에서 로그인 사용자 정보를 꺼낸다 — payload는 base64url이라 표준 atob 전에 문자 치환이 필요
const parseAccessToken = (token: string | null): { email: string; role: string } | null => {
	if (!token) return null;
	try {
		return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
	} catch {
		return null;
	}
};

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

	const user = parseAccessToken(accessToken);

	useEffect(() => {
		if (user) {
			if (user.role === 'ADVERTISER' || user.role === 'MEDIA') {
				handleLogout();
			} else {
				sessionStorage.setItem('userType', user.role === 'DEVELOPER' ? 'dev' : user.role.toLowerCase());
			}
		}
	}, []);

	const forceReload = () => {
		navigate('/');
		window.location.reload();
	};

	const handleMenuClick = (menuEvent: { key: string }) => {
		const { key } = menuEvent;
		store.setSelectedMenu(key);
		navigate(`/${key}`);
	};

	const menuItems: MenuProps['items'] = [
		{
			label: 'Dashboard',
			key: '',
			icon: <HomeOutlined />,
		},
		{
			label: '광고앱 관리',
			key: 'advertising',
			icon: <FontAwesomeIcon icon={faAd} />,
		},
		{
			label: '매체 관리',
			key: 'media',
			icon: <ApartmentOutlined />,
		},
		{
			label: '트래커 관리',
			key: 'tracker',
			icon: <FontAwesomeIcon icon={faChartLine} />,
		},
		{
			label: '개발자 메뉴',
			key: 'developer',
			icon: <SettingOutlined />,
			disabled: user?.role !== 'DEVELOPER',
		},
	];

	const profileContent = (
		<Button type="primary" onClick={handleLogout}>
			Logout
		</Button>
	);

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
					<Popover content={profileContent}>
						<UserProfile>{user?.email}</UserProfile>
					</Popover>
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
