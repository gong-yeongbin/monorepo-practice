import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// 서버 타임존과 무관하게 KST 기준 오늘 날짜를 UTC 자정 Date로 반환한다 (daily_statistic.created_date는 @db.Date)
export const kstBaseDate = (): Date => dayjs.utc(dayjs().tz('Asia/Seoul').format('YYYY-MM-DD')).toDate();
