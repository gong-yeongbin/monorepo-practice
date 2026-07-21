import { makeAutoObservable } from 'mobx';
import React, { createContext, useContext, FC, PropsWithChildren } from 'react';
import { IColumns as IDetail } from './pages/Detail/Table';
import { Iinfo } from './components/InfoCard';
import { IColumns as ICampaigns } from './pages/Advertising/Campaigns/Table';
import { IColumns as ICampaignEvents } from './pages/Advertising/Campaigns/Events/Table';

class Store {
	pageTitle = '';

	selectedMenu = '';

	detail: Array<IDetail> = [];

	info: Iinfo = {
		advertiser: '',
		tracker: '',
		advertising: '',
		advertisingImageUrl: '',
		media: [],
	};

	eventName = '';

	campaigns: Array<ICampaigns> = [];

	campaignEvents: Array<ICampaignEvents> = [];

	constructor() {
		makeAutoObservable(this);
	}

	setPageTitle(data: string) {
		this.pageTitle = data;
	}

	setSelectedMenu(data: string) {
		this.selectedMenu = data;
	}

	setDetail(data: Array<IDetail>) {
		this.detail = data;
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

	setCampaigns(data: Array<ICampaigns>) {
		this.campaigns = data;
	}

	setCampaignEvents(data: Array<ICampaignEvents>) {
		this.campaignEvents = data;
	}
}

const StoreContext = createContext<Store>(new Store());

const StoreProvider: FC<PropsWithChildren<{ store: Store }>> = ({ store, children }) => {
	return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

const useStore = () => {
	return useContext(StoreContext);
};

export { Store, StoreProvider, useStore };
