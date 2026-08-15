import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { useStore } from '@/app/store';

const Developer = observer(() => {
	const store = useStore();

	useEffect(() => {
		store.setPageTitle('개발자 메뉴');
	}, []);

	return null;
});

export default Developer;
