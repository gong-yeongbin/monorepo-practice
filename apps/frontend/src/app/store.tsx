import { makeAutoObservable } from 'mobx';
import React, { createContext, useContext, FC, PropsWithChildren } from 'react';
import { Iinfo } from '@/shared/ui/InfoCard/InfoCard';

class Store {
	pageTitle = '';

	selectedMenu = '';

	info: Iinfo = {
		advertiser: '',
		tracker: '',
		advertising: '',
		advertisingImageUrl: '',
		media: [],
	};

	eventName = '';

	constructor() {
		makeAutoObservable(this);
	}

	setPageTitle(data: string) {
		this.pageTitle = data;
	}

	setSelectedMenu(data: string) {
		this.selectedMenu = data;
	}

	setInfo(
		data = {
			advertiser: '',
			tracker: '',
			advertising: '',
			advertisingImageUrl: '',
			media: [],
		},
	) {
		this.info = data;
	}

	setEventName(data: string) {
		this.eventName = data;
	}
}

const StoreContext = createContext<Store>(new Store());

const StoreProvider: FC<PropsWithChildren<{ store: Store }>> = ({ store, children }) => {
	return <StoreContext value={store}>{children}</StoreContext>;
};

const useStore = () => {
	return useContext(StoreContext);
};

export { Store, StoreProvider, useStore };
