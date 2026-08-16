import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Button, Modal, message, Alert, Space, Form } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { CopyOutlined, InfoCircleFilled, SearchOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams, useMatch } from 'react-router';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import {
	DataContainer,
	Container,
	Title,
	Label,
	ImageContainer,
	InfoContainer,
	StyledAvatar,
	UploadWrapper,
	EditText,
	StyledUpload,
} from '@/shared/ui/info-card/info-card.styles';
import { useStore } from '@/app/store';
import { axiosInstance } from '@/shared/api/axios';
import { mapAdvertisingInfo, mapCampaignInfo } from '@/shared/api/api';
import { DefaultImg } from '@/app/global-styles';
import { DetailColumns } from '@/features/detail/detail-table';
import { CampaignColumns } from '@/features/advertising/campaigns/campaigns-table';
import logo from '@/images/logo.png';

export interface Info {
	advertiser: string;
	tracker: string;
	advertising: string;
	advertisingImageUrl: string;
	media: string[];
}
export interface SecondInfo {
	appkey: string;
	createdAt: string;
	idx: string;
	mecrossTrackingStatus: number;
	mecrossTrackingUrl: string;
	name: string;
	status: number;
	token: string;
	trackerTrackingStatus: number;
	trackerTrackingUrl: string;
	type: string;
	updatedAt: string;
}

const InfoCard = observer(() => {
	const [trackerUrlVisible, setTrackerUrlVisible] = useState(false);
	const [mecrossUrlVisible, setMecrossUrlVisible] = useState(false);
	const [selectedFile, setSelectedFile] = useState<any>(null);
	const [newImageUrl, setNewImageUrl] = useState('');
	const [showUpdatedImage, setShowUpdatedImage] = useState(false);

	const store = useStore();
	const { info } = store;
	const { advertisingImageUrl, advertising, advertiser, tracker } = info;
	const isPageChange = useMatch('/:id/change');
	const isPageDaily = useMatch('/:id/daily/*');
	const isPageAdvertising = useMatch('advertising/*');
	const isPageAdvertisingEvent = useMatch('advertising/:id/events/:campaignIdx');

	const { id: paramId, campaignIdx: paramCampaignIdx } = useParams();

	// mediaNames는 각 페이지가 fetch해둔 쿼리 캐시를 구독만 한다(여기서 재요청하지 않음).
	const { data: detailCache } = useQuery<Array<DetailColumns>>({
		queryKey: ['detail', { paramId }],
		enabled: false,
	});
	const { data: campaignsCache } = useQuery<Array<CampaignColumns>>({
		queryKey: ['campaignList'],
		enabled: false,
	});

	const duplMediaNames = isPageAdvertising
		? (campaignsCache ?? []).map(item => item.mediaName)
		: (detailCache ?? []).map(item => item.mediaName);
	const mediaNames = Array.from(new Set(duplMediaNames));

	const [form] = Form.useForm();

	const navigate = useNavigate();

	const formData = new FormData();

	const queryClient = useQueryClient();

	useEffect(() => {
		if (selectedFile) {
			let newURL = '';
			newURL = URL.createObjectURL(selectedFile);
			setNewImageUrl(newURL);
		}
	}, [selectedFile]);

	const getAdInfo = async () => {
		const res = await axiosInstance.get(`/advertising/${paramId}`);
		const mapped = mapAdvertisingInfo(res.data.data);
		store.setInfo(mapped);
		return mapped;
	};

	const getSecondInfo = async () => {
		const res = await axiosInstance.get(`/campaigns/${paramCampaignIdx}`);
		return mapCampaignInfo(res.data.data);
	};

	const { data: adInfo, error: adInfoError } = useQuery({
		queryKey: ['info', paramId],
		queryFn: getAdInfo,
	});

	const { data: secondInfo, error: secondInfoError } = useQuery({
		queryKey: ['secondInfo', paramId],
		queryFn: getSecondInfo,
		enabled: !!isPageAdvertisingEvent,
	});

	const handleNoMatchRoute = (data: any) => {
		if (!data) {
			navigate('/');
		}
	};

	const handleErrors = (error: unknown) => {
		if (error instanceof Error && error.message.includes('400')) {
			navigate('/');
		} else {
			sessionStorage.clear();
			navigate('/login');
		}
	};

	useEffect(() => {
		if (adInfoError) handleErrors(adInfoError);
		else if (adInfo !== undefined) handleNoMatchRoute(adInfo);
	}, [adInfo, adInfoError]);

	useEffect(() => {
		if (secondInfoError) handleErrors(secondInfoError);
		else if (secondInfo !== undefined) handleNoMatchRoute(secondInfo);
	}, [secondInfo, secondInfoError]);

	const handleCancel = () => {
		setTrackerUrlVisible(false);
		setMecrossUrlVisible(false);
	};

	const showCopySuccess = () => {
		message.success(`URL을 클립보드에 복사했습니다.`);
	};

	const resetImage = () => {
		setSelectedFile(null);
		URL.revokeObjectURL(selectedFile);
		setShowUpdatedImage(false);
	};

	const updateImage = () => {
		mutationImage.mutate();
	};

	const mutationImage = useMutation({
		mutationFn: () => {
			const { image } = form.getFieldsValue();
			formData.append('image', image.file);
			return axiosInstance.post(`/advertising/${paramId}/image`, formData);
		},
		onSuccess: () => {
			setShowUpdatedImage(true);
			setSelectedFile(null);
			URL.revokeObjectURL(selectedFile);
			queryClient.invalidateQueries({ queryKey: ['info'] });
		},
		onError: () => {
			sessionStorage.clear();
			navigate('/login');
		},
	});

	const alertMessage = selectedFile && newImageUrl && (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				paddingBottom: '1rem',
			}}
		>
			<p>
				<InfoCircleFilled
					style={{
						marginRight: '0.3rem',
						color: 'var(--blue)',
					}}
				/>
				<strong>{selectedFile.name}</strong>을 업로드합니다.
			</p>
			<img src={newImageUrl} alt="preview" style={{ width: '100px' }} />
		</div>
	);

	const props = {
		beforeUpload: (file: any) => {
			setShowUpdatedImage(false);
			return false;
		},
		onChange: (info: any) => {
			const { file } = info;
			setSelectedFile(file);
		},
	};

	return (
		info && (
			<Container
				padding={isPageChange && '0.7rem'}
				gridColumns={isPageAdvertisingEvent && '1fr 1fr'}
			>
				<DataContainer>
					<ImageContainer>
						{isPageAdvertising && !isPageAdvertisingEvent ? (
							<UploadWrapper>
								<Form form={form} id="infocard-image-form">
									<Form.Item name="image">
										<StyledUpload
											{...props}
											showUploadList={false}
											accept="image/*"
											listType="picture-card"
										>
											<EditText>
												<FontAwesomeIcon icon={faCamera} style={{ fontSize: '1rem' }} />
											</EditText>
											{advertisingImageUrl ? (
												<StyledAvatar
													shape="square"
													size={70}
													src={
														showUpdatedImage ? newImageUrl : `${advertisingImageUrl}?${uuidv4()}`
													}
												/>
											) : (
												<DefaultImg
													width={isPageChange ? '55px' : '70px'}
													alt="default"
													src={showUpdatedImage ? newImageUrl : logo}
												/>
											)}
										</StyledUpload>
									</Form.Item>
								</Form>

								{selectedFile && (
									<Alert
										style={{
											display: 'flex',
											flexDirection: 'column',
											position: 'fixed',
											top: '20%',
											left: '50%',
											transform: 'translateX(-50%)',
											zIndex: 100,
										}}
										message={alertMessage}
										type="info"
										action={
											<Space>
												<Button size="small" style={{ color: 'var(--blue)' }} onClick={updateImage}>
													확인
												</Button>
												<Button size="small" onClick={resetImage}>
													취소
												</Button>
											</Space>
										}
									/>
								)}
							</UploadWrapper>
						) : advertisingImageUrl ? (
							<StyledAvatar size={isPageChange ? 55 : 70} src={advertisingImageUrl} />
						) : (
							<DefaultImg width={isPageChange ? '55px' : '70px'} alt="default" src={logo} />
						)}
					</ImageContainer>

					<InfoContainer>
						<Title>{advertising}</Title>
						{!isPageChange && (
							<li>
								<Label>광고주</Label>
								<span> | {advertiser}</span>
							</li>
						)}
						<li>
							<Label>트랙킹 솔루션</Label>
							<span> | {tracker}</span>
						</li>
						{!isPageChange && (
								<li>
									{isPageDaily || isPageAdvertisingEvent ? (
										<>
											<Label>선택 매체사 </Label>
											<span>
												|{' '}
												{isPageDaily
													? sessionStorage.getItem('mediaName')
													: sessionStorage.getItem('eventMediaName')}
											</span>
										</>
									) : mediaNames.length === 0 ? (
										// eslint-disable-next-line react/jsx-no-useless-fragment
										<></>
									) : mediaNames && mediaNames.length > 1 ? (
										<>
											<Label>{`매체사(${mediaNames.length})`}</Label>
											<span> | {mediaNames.join(', ')}</span>
										</>
									) : (
										<>
											<Label>매체사</Label>
											<span> | {mediaNames}</span>
										</>
									)}
								</li>
						)}
					</InfoContainer>
				</DataContainer>

				{isPageAdvertisingEvent && (
					<DataContainer>
						<InfoContainer style={{ lineHeight: 2 }}>
							<>
									<li>
										<Label>캠페인</Label>
										<span> | {secondInfo?.name}</span>
									</li>
									<li>
										<Label>TYPE</Label>
										<span> | {secondInfo?.type}</span>
									</li>
									<li>
										<Label>상태</Label>
										<span> | {secondInfo?.status === 1 ? '진행 중' : '-'}</span>
									</li>
									<li>
										<Label style={{ marginRight: '0.5rem' }}>트래커 트래킹 URL</Label>
										<span>| </span>
										<Modal
											title="트래커 트래킹 URL"
											footer={false}
											onCancel={handleCancel}
											open={trackerUrlVisible}
										>
											<p>{secondInfo?.trackerTrackingUrl}</p>
										</Modal>
										<Button
											icon={<SearchOutlined />}
											shape="circle"
											size="small"
											style={{ marginRight: '0.5rem' }}
											onClick={() => setTrackerUrlVisible(true)}
										/>
										<CopyToClipboard text={secondInfo?.trackerTrackingUrl ?? ''} onCopy={showCopySuccess}>
											<Button
												icon={<CopyOutlined />}
												shape="circle"
												size="small"
												style={{ color: 'var(--blue)' }}
											/>
										</CopyToClipboard>
									</li>
									<li>
										<Label style={{ marginRight: '0.5rem' }}>MECROSS 트래킹 URL</Label>
										<span>| </span>
										<Modal
											title="MECROSS 트래킹 URL"
											footer={false}
											onCancel={handleCancel}
											open={mecrossUrlVisible}
										>
											<p>{secondInfo?.mecrossTrackingUrl}</p>
										</Modal>
										<Button
											icon={<SearchOutlined />}
											shape="circle"
											size="small"
											style={{ marginRight: '0.5rem' }}
											onClick={() => setMecrossUrlVisible(true)}
										/>
										<CopyToClipboard text={secondInfo?.mecrossTrackingUrl ?? ''} onCopy={showCopySuccess}>
											<Button
												icon={<CopyOutlined />}
												shape="circle"
												size="small"
												style={{ color: 'var(--blue)' }}
											/>
										</CopyToClipboard>
									</li>
							</>
						</InfoContainer>
					</DataContainer>
				)}
			</Container>
		)
	);
});

export default InfoCard;
