-- daily_report 대시보드 조회용 인덱스 2개를 추가한다.
-- 기존 unique(view_code, created_date)는 선두가 view_code라 created_date·token으로 들어오는
-- 조회 4개(dashboard·daily·dailyDetail·detail)가 모두 seq scan이었다.

-- CreateIndex
-- 일자/기간 전체 합산: dashboard(created_date = ?), daily·detail(created_date BETWEEN ?)
CREATE INDEX "daily_report_created_date_idx" ON "daily_report"("created_date");

-- CreateIndex
-- 캠페인 한정 조회: dailyDetail(token = ? AND created_date BETWEEN ?), daily(token 지정 시).
-- token은 FK지만 PostgreSQL이 FK 인덱스를 자동 생성하지 않는다.
CREATE INDEX "daily_report_token_created_date_idx" ON "daily_report"("token", "created_date");
