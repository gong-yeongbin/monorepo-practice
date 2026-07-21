import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import koKR from 'antd/lib/locale/ko_KR';
import Home from '@/features/home/Home';
import Login from '@/features/login/Login';
import GlobalStyles from '@/app/globalStyles';
import { Store, StoreProvider } from '@/app/store';
import Dashboard from '@/features/home/Dashboard';
import Media from '@/features/media/Media';
import Trackers from '@/features/trackers/Trackers';
import Developer from '@/features/developer/Developer';
import Detail from '@/features/detail/Detail';
import Change from '@/features/detail/Change/Change';
import Daily from '@/features/detail/Daily/Daily';
import DailyDetail from '@/features/detail/Daily/DailyDetail/DailyDetail';
import Advertising from '@/features/advertising/Advertising';
import Campaigns from '@/features/advertising/Campaigns/Campaigns';
import Events from '@/features/advertising/Campaigns/Events/Events';
import PrivateRoute from '@/shared/ui/PrivateRoute';

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
