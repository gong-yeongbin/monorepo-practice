import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import koKR from 'antd/lib/locale/ko_KR';
import Home from '@/features/home/home';
import Login from '@/features/login/login';
import GlobalStyles from '@/app/global-styles';
import { Store, StoreProvider } from '@/app/store';
import Dashboard from '@/features/home/dashboard';
import Media from '@/features/media/media';
import Trackers from '@/features/trackers/trackers';
import Developer from '@/features/developer/developer';
import Detail from '@/features/detail/detail';
import Change from '@/features/detail/change/change';
import Daily from '@/features/detail/daily/daily';
import DailyDetail from '@/features/detail/daily/daily-detail/daily-detail';
import Advertising from '@/features/advertising/advertising';
import Campaigns from '@/features/advertising/campaigns/campaigns';
import Events from '@/features/advertising/campaigns/events/events';
import PrivateRoute from '@/shared/ui/private-route';

const store = new Store();

// react-query v5는 useQuery별 onError를 제거해, 공통 인증 에러(세션 만료 → 로그인 이동)를
// QueryCache 전역 핸들러로 처리한다. 컴포넌트 밖이라 navigate 대신 location으로 이동한다.
const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: () => {
			sessionStorage.clear();
			window.location.href = '/login';
		},
	}),
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
		},
	},
});

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<StoreProvider store={store}>
				<ConfigProvider locale={koKR}>
					<GlobalStyles />
					<BrowserRouter>
						<Routes>
							<Route path="/login" element={<Login />} />
							<Route path="*" element={<Navigate to="/" />} />
							<Route path="/" element={<Home />}>
								<Route path="/" element={<Dashboard />} />
								<Route path=":id" element={<Detail />} />
								<Route path=":id/change" element={<Change />} />
								<Route path=":id/daily" element={<Daily />} />
								<Route path=":id/daily/detail" element={<DailyDetail />} />
								<Route path="advertising" element={<Advertising />} />
								<Route path="advertising/:id" element={<Campaigns />} />
								<Route path="advertising/:id/events/:campaignIdx" element={<Events />} />
								<Route path="media" element={<Media />} />
								<Route path="trackers" element={<Trackers />} />
								<Route
									path="developer"
									element={
										<PrivateRoute>
											<Developer />
										</PrivateRoute>
									}
								/>
							</Route>
						</Routes>
					</BrowserRouter>
				</ConfigProvider>
			</StoreProvider>
		</QueryClientProvider>
	);
}

export default App;
