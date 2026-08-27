import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { getAuthUser, Role } from '@/shared/lib/auth';

// 허용 역할이 아니면 대시보드로 되돌린다. children이 없으면 중첩 라우트 그룹의 레이아웃으로 동작한다.
// 판정은 access token payload에서 직접 읽는다 — sessionStorage에 따로 저장하면 부모 effect보다 자식이 먼저 도는 순서 문제가 생긴다.
function PrivateRoute(props: { allow: Role[]; children?: React.JSX.Element }) {
	const { allow, children } = props;
	const user = getAuthUser();
	if (!user || !allow.includes(user.role)) return <Navigate to="/" replace />;
	return children ?? <Outlet />;
}

export default PrivateRoute;
