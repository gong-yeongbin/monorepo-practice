import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Avatar, Layout, Breadcrumb, Select, Popover, Button, Dropdown } from 'antd';
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
	SkeletonSelect,
	StyledSelect,
	Logo,
	ProfileContainer,
	StyledHeader,
	SubTitle,
	Title,
	UserProfile,
	StyledFooter,
	LogoAndMenu,
	StyledContent,
} from './styles';
import { useStore } from '../../store';
import { api } from '../../api';
import logo from '../../images/logo.png';

const { Option, OptGroup } = Select;

interface ISelectList {
	idx: number;
	name: string;
	platform: string;
	imgUrl: string;
	tracker: string;
}

const Home = observer(() => {
	const [selectBar, setSelectBar] = useState([]);

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
			setSelectBar([]);
		} else if (pathname === `/media`) {
			store.setSelectedMenu('media');
			setSelectBar([]);
		} else if (pathname === `/trackers`) {
			store.setSelectedMenu('trackers');
			setSelectBar([]);
		} else if (pathname === `/developer`) {
			store.setSelectedMenu('developer');
			setSelectBar([]);
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

	const { isFetching: isFetchingSelectList, data: selectList } = useQuery({
		queryKey: ['selectList'],
		queryFn: api.getSelectList,
		enabled: !!accessToken,
	});

	const aosAd = selectList?.filter((ad: ISelectList) => ad.platform === 'AOS');
	const iosAd = selectList?.filter((ad: ISelectList) => ad.platform === 'iOS');

	const forceReload = () => {
		navigate('/');
		window.location.reload();
	};

	const handleSelectChange = (value: any, option: any) => {
		setSelectBar(value);
		navigate(`/${option.key}`);
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
			key: 'trackers',
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

	const makeSelectOptions = (ad: ISelectList) => {
		return (
			<Option key={ad.idx} value={`${ad.name} [${ad.tracker}]`}>
				{ad.name} [{ad.tracker}]
			</Option>
		);
	};

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

				{isFetchingSelectList ? (
					<SkeletonSelect active />
				) : (
					<StyledSelect
						placeholder="광고앱 보기"
						value={selectBar}
						onChange={handleSelectChange}
						labelInValue
					>
						<OptGroup label="Google Play">{aosAd?.map(makeSelectOptions)}</OptGroup>
						<OptGroup label="App Store">{iosAd?.map(makeSelectOptions)}</OptGroup>
					</StyledSelect>
				)}

				<ProfileContainer>
					<Popover content={profileContent}>
						<UserProfile>{!isFetchingProfile && profile?.id}</UserProfile>
					</Popover>
				</ProfileContainer>
			</StyledHeader>

			<Breadcrumb>
				<Breadcrumb.Item>{pageTitle}</Breadcrumb.Item>
			</Breadcrumb>

			<StyledContent>
				<Outlet />
			</StyledContent>

			<StyledFooter>© 2021 OneTwoAd</StyledFooter>
		</Layout>
	);
});

export default Home;
