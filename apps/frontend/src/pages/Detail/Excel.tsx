import React, { useState, useEffect, useRef, useCallback, KeyboardEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { observer } from 'mobx-react';
import {
	Button,
	Dropdown,
	DatePicker,
	Radio,
	Space,
	RadioChangeEvent,
	Popconfirm,
	Modal,
	Spin,
	message,
} from 'antd';
import moment from 'moment';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { CSVLink } from 'react-csv';
import { useStore } from '../../store';
import { axiosInstance } from '../../axios';
import { DropdownForm, ExcelButton, LoadingContents, DropdownContainer, FileName } from './styles';

const { RangePicker } = DatePicker;

const Excel = observer(() => {
	const [visible, setVisible] = useState(false);
	const [submitDisabled, setSubmitDisabled] = useState(true);
	const [loading, setLoading] = useState(false);
	const [excel, setExcel] = useState([]);
	const [value, setValue] = useState();
	const [hackValue, setHackValue] = useState<any>();
	const [dates, setDates] = useState<any>();
	const [dateStrings, setDateStrings] = useState<string[]>([]);
	const [eventType, setEventType] = useState<number | null>();

	const store = useStore();
	const { info } = store;

	const navigate = useNavigate();

	const { id: paramId } = useParams();

	const csvInstance = useRef<any | null>(null);
	// const dropdownRef = useRef<any | null>(null);

	// useEffect(() => {
	// 	const closeOnClickOutside = (event: MouseEvent) => {
	// 		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
	// 			setVisible(false);
	// 		}
	// 	};
	// 	document.addEventListener('mousedown', closeOnClickOutside);
	// 	return () => {
	// 		document.removeEventListener('mousedown', closeOnClickOutside);
	// 	};
	// }, [dropdownRef]);

	useEffect(() => {
		if (excel && csvInstance && csvInstance.current && csvInstance.current.link) {
			setTimeout(() => {
				csvInstance.current.link.click();
				setExcel([]);
			});
		}
	}, [excel]);

	useEffect(() => {
		if (dates && dates.length > 0)
			setDateStrings([
				moment(dates[0]).format('YYYY-MM-DD'),
				moment(dates[1]).format('YYYY-MM-DD'),
			]);
	}, [dates]);

	useEffect(() => {
		if (dates && dates.length > 0 && eventType) {
			setSubmitDisabled(false);
		}
	}, [dates, eventType]);

	const handleRadioChange = (e: RadioChangeEvent) => {
		setEventType(e.target.value);
	};

	const resetOnExcelBtnClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
		e.preventDefault();
		setVisible(true);
		setSubmitDisabled(true);
		setEventType(null);
		setHackValue([]);
		setDates([]);
	};

	const downloadExcel = async () => {
		setVisible(false);
		setLoading(true);
		try {
			const response = await axiosInstance.get(
				`/${eventType}/${info.tracker}/excel?advertisingIdx=${paramId}&startDate=${dateStrings[0]}&endDate=${dateStrings[1]}`,
			);
			if (response.data.data?.length === 0) {
				message.info('데이터가 없습니다.');
			}
			setExcel(response.data.data);
			clearCacheData();
		} catch (error) {
			sessionStorage.clear();
			navigate('/login');
		}
		setLoading(false);
	};

	const clearCacheData = () => {
		if ('caches' in window) {
			caches.keys().then(names => {
				names.forEach(name => {
					caches.delete(name);
				});
			});
		}
	};

	const disableDate = (current: any) => {
		if (!dates || dates.length === 0) {
			return current && current > moment().endOf('day');
		}
		const tooLate = dates[0] && current.diff(dates[0], 'days') > 30;
		const tooEarly = dates[1] && dates[1].diff(current, 'days') > 30;
		return tooEarly || tooLate || current > moment().endOf('day');
	};

	const handleEscPress = useCallback((event: KeyboardEvent) => {
		if (event.code === 'Escape') {
			setValue(undefined);
		}
	}, []);

	const onStartOrEndDateChange = (val: any) => {
		setDates(val);
	};

	const onAllDatesSelected = (val: any) => {
		setValue(val);
	};

	const onCalendarOpenChange = (open: boolean) => {
		if (open) {
			setHackValue([]);
			setDates([]);
		} else {
			setHackValue(undefined);
		}
	};

	// const dropdownContents = (
	// 	<DropdownContainer ref={dropdownRef} id="dropdown">
	// 		<DropdownForm id="excel-form">
	// 			<RangePicker
	// 				// getPopupContainer={() => document.getElementById('dropdown') as HTMLElement}
	// 				onKeyDown={handleEscPress}
	// 				allowClear={false}
	// 				value={hackValue || value}
	// 				disabledDate={disableDate}
	// 				onCalendarChange={onStartOrEndDateChange}
	// 				onChange={onAllDatesSelected}
	// 				onOpenChange={onCalendarOpenChange}
	// 				defaultPickerValue={[
	// 					moment().subtract(1, 'months').startOf('month'),
	// 					moment().endOf('month'),
	// 				]}
	// 			/>

	// 			<Radio.Group onChange={handleRadioChange} value={eventType} style={{ margin: '1.5rem' }}>
	// 				<Space direction="vertical">
	// 					<Radio value="install">Install</Radio>
	// 					<Radio value="event">Event</Radio>
	// 				</Space>
	// 			</Radio.Group>

	// 			<Popconfirm
	// 				title="다운로드하시겠습니까?"
	// 				onConfirm={downloadExcel}
	// 				okText="Yes"
	// 				cancelText="No"
	// 				disabled={submitDisabled}
	// 			>
	// 				<Button
	// 					type="primary"
	// 					size="small"
	// 					style={{ marginRight: '0.5rem' }}
	// 					htmlType="submit"
	// 					disabled={submitDisabled}
	// 				>
	// 					확인
	// 				</Button>
	// 			</Popconfirm>
	// 		</DropdownForm>
	// 	</DropdownContainer>
	// );

	return (
		<>
			{/* <Dropdown overlay={dropdownContents} visible={visible} placement="bottomRight"> */}
			<ExcelButton className="ant-dropdown-link" onClick={resetOnExcelBtnClick}>
				<DownloadOutlined />
				엑셀 출력
			</ExcelButton>
			{/* </Dropdown> */}

			<Modal
				visible={visible}
				onCancel={() => {
					setVisible(false);
				}}
				footer={null}
				className="excel-modal"
			>
				<DropdownForm id="excel-form">
					<RangePicker
						onKeyDown={handleEscPress}
						allowClear={false}
						value={hackValue || value}
						disabledDate={disableDate}
						onCalendarChange={onStartOrEndDateChange}
						onChange={onAllDatesSelected}
						onOpenChange={onCalendarOpenChange}
						defaultPickerValue={[
							moment().subtract(1, 'months').startOf('month'),
							moment().endOf('month'),
						]}
					/>

					<Radio.Group onChange={handleRadioChange} value={eventType} style={{ margin: '1.5rem' }}>
						<Space direction="vertical">
							<Radio value="install">Install</Radio>
							<Radio value="event">Event</Radio>
						</Space>
					</Radio.Group>

					<Popconfirm
						title="다운로드하시겠습니까?"
						onConfirm={downloadExcel}
						okText="Yes"
						cancelText="No"
						disabled={submitDisabled}
					>
						<Button
							type="primary"
							size="small"
							style={{ marginRight: '0.5rem' }}
							htmlType="submit"
							disabled={submitDisabled}
						>
							확인
						</Button>
					</Popconfirm>
				</DropdownForm>
			</Modal>

			{excel && excel.length > 0 && (
				<CSVLink
					data={excel}
					ref={csvInstance}
					filename={`${dateStrings[0].slice(2).replaceAll('-', '')}_${dateStrings[1]
						.slice(2)
						.replaceAll('-', '')}_${eventType}_${info.advertising}.xls`}
				/>
			)}
			<Modal
				getContainer={false}
				visible={loading}
				closable={false}
				footer={null}
				width="20vw"
				style={{ minWidth: '20rem' }}
				centered
			>
				<LoadingContents>
					Loading...
					<Spin
						indicator={<LoadingOutlined style={{ fontSize: 24, verticalAlign: 'middle' }} spin />}
					/>
					<FileName>
						{dateStrings && dateStrings.length > 0 && (
							<strong>
								{dateStrings[0].slice(2).replaceAll('-', '')}_
								{dateStrings[1].slice(2).replaceAll('-', '')}_{eventType}_{info.advertising}
								.xls
							</strong>
						)}
					</FileName>
				</LoadingContents>
			</Modal>
		</>
	);
});

export default Excel;
