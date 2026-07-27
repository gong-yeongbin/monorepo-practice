import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router';
import { Avatar, Layout, Breadcrumb, Popover, Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
	ApartmentOutlined,
	AppstoreOutlined,
	HomeOutlined,
	SettingOutlined,
} from '@ant-design/icons';
import { observer } from 'mobx-react';
import { useQuery } from '@tanstack/react-query';
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
} from '@/features/home/home.styles';
import { useStore } from '@/app/store';
import { api } from '@/shared/api/api';
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

	const { isFetching: isFetchingProfile, data: profile } = useQuery({
		queryKey: ['profile'],
		queryFn: api.getUserProfile,
		enabled: !!accessToken,
	});

	useEffect(() => {
		if (profile) {
			if (profile.type === 'advertiser' || profile.type === 'media') {
				handleLogout();
			} else {
				sessionStorage.setItem('userType', profile.type);
			}
		}
	}, [profile]);

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
			disabled: profile?.type !== 'dev' && true,
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

					<Dropdown
						menu={{
							id: 'menu-list',
							onClick: handleMenuClick,
							items: menuItems,
							selectedKeys: [selectedMenu],
							theme: 'dark',
						}}
					>
						<Button id="menu-button">
							<AppstoreOutlined />
							MENU
						</Button>
					</Dropdown>
				</LogoAndMenu>

				<ProfileContainer>
					<Popover content={profileContent}>
						<UserProfile>{!isFetchingProfile && profile?.id}</UserProfile>
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
