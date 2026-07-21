import React from 'react';
import { axiosInstance } from '@/shared/api/axios';

const getDataWithCVR = (data: any) => {
	data.forEach((obj: { cvr: number; install: string; click: string }) => {
		const cvrData = (parseInt(obj.install, 10) / parseInt(obj.click, 10)) * 100;
		const roundedCvr = roundCVR(cvrData);
		const checkedCvr = checkIfNumber(roundedCvr);
		obj.cvr = checkedCvr;
	});
	return [...data];
};

const checkIfNumber = (cvr: any) => {
	if (Number.isNaN(cvr) || !Number.isFinite(cvr)) {
		return 0;
	}
	return cvr;
};

const roundCVR = (data: number) => {
	const m = Number((Math.abs(data) * 100).toPrecision(15));
	return (Math.round(m) / 100) * Math.sign(data);
};

const getDashboardData = async (date: string) => {
	const res = await axiosInstance.get(`/advertising/dashboard?date=${date}`);
	return res.data.data;
};

const getDetail = async (info: { date: (string | null)[]; paramId: string | undefined }) => {
	const { date, paramId } = info;
	const res = await axiosInstance.get(
		`/advertising/detail/${paramId}?startDate=${date[0]}&endDate=${date[1]}`,
	);
	const dataWithCVR = getDataWithCVR(res.data.data);
	return dataWithCVR;
};

const getMedia = async () => {
	const res = await axiosInstance.get(`/media`);
	return res.data.data;
};

const getTrackers = async () => {
	const res = await axiosInstance.get(`/tracker`);
	return res.data;
};

const getAdvertisers = async () => {
	const res = await axiosInstance.get(`/advertiser`);
	return res.data.data;
};

const getUserProfile = async () => {
	const res = await axiosInstance.get(`/profile`);
	return res.data.data;
};

const getSelectList = async () => {
	const res = await axiosInstance.get(`/advertising/list`);
	return res.data.data;
};

const getDaily = async (date: (string | null)[]) => {
	const token = sessionStorage.getItem('detailToken');
	const res = await axiosInstance.get(
		`/advertising/daily?startDate=${date[0]}&endDate=${date[1]}&token=${token}`,
	);
	const dataWithCVR = getDataWithCVR(res.data.data);
	return dataWithCVR;
};

const getDailyDetail = async (info: {
	date: (string | null)[];
	orderType: string;
	order: string;
}) => {
	const { date, orderType, order } = info;
	const token = sessionStorage.getItem('detailToken');
	const res = await axiosInstance.get(
		`/advertising/dailydetail?startDate=${date[0]}&endDate=${date[1]}&type=${orderType}&order=${order}&token=${token}`,
	);
	const dataWithCVR = getDataWithCVR(res.data.data);
	return dataWithCVR;
};

const getChangeCreated = async (paramId?: string) => {
	const res = await axiosInstance.get(`/reservation/on/${paramId}`);
	return res.data.data;
};

const getChangeReserved = async (paramId?: string) => {
	const res = await axiosInstance.get(`/reservation/off/${paramId}`);
	return res.data.data;
};

const getAdvertising = async (obj: {
	// pageNumber: number;
	status: number;
	searchWords?: string;
}) => {
	const {
		// pageNumber,
		status,
		searchWords,
	} = obj;
	const res = await axiosInstance.get(
		`/advertising?search=${searchWords}&status=${status}&offset=0&limit=100`,
	);
	// const res = await axiosInstance.get(
	// 	`/advertising?search=${searchWords}&status=${status}&offset=${pageNumber}&limit=100`,
	// );
	return res.data.data;
};

const getDeveloperList = async (listType: string) => {
	const res = await axiosInstance.get(`/${listType}`);
	return res.data.data;
};

const getCampaigns = async (paramId?: string) => {
	const res = await axiosInstance.get(`/advertising/campaign/${paramId}`);
	return res.data.data;
};

const getCampaignEvents = async (campaignIdx?: string) => {
	const res = await axiosInstance.get(`/campaign/${campaignIdx}/event`);
	return res.data.data;
};

export const api = {
	getDashboardData,
	getDetail,
	getMedia,
	getTrackers,
	getAdvertisers,
	getUserProfile,
	getSelectList,
	getDaily,
	getDailyDetail,
	getChangeCreated,
	getChangeReserved,
	getAdvertising,
	getDeveloperList,
	getCampaigns,
	getCampaignEvents,
};
