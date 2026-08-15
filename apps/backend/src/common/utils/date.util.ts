import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// 서버 타임존과 무관하게 KST 기준 오늘 날짜를 UTC 자정 Date로 반환한다 (daily_report.created_date는 @db.Date)
export const kstBaseDate = (): Date => dayjs.utc(dayjs().tz('Asia/Seoul').format('YYYY-MM-DD')).toDate();

// KST 일자 문자열 범위(YYYY-MM-DD)를 [시작일 00:00, 종료일 다음날 00:00) Date 쌍으로 반환한다 (end는 exclusive)
export const kstDayRange = (startDate: string, endDate: string): { start: Date; end: Date } => ({
	start: dayjs.tz(startDate, 'Asia/Seoul').toDate(),
	end: dayjs.tz(endDate, 'Asia/Seoul').add(1, 'day').toDate(),
});
