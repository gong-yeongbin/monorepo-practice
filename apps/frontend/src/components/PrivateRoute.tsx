import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute(props: { children: JSX.Element }) {
	const { children } = props;
	const userType = sessionStorage.getItem('userType');
	return userType === 'dev' ? children : <Navigate to="/" replace />;
}

export default PrivateRoute;
