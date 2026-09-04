-- campaign.name과 reservation.name을 30 → 50으로 확대.
-- 예약명은 적용 시 캠페인명으로 그대로 들어가므로 두 컬럼은 같은 길이여야 한다.
-- 30자를 넘는 이름으로 예약을 만들면 Postgres 길이 오류가 500으로 떨어져 화면에서는 "예약 설정에 실패했습니다."로만 보였다.

ALTER TABLE "campaign" ALTER COLUMN "name" SET DATA TYPE VARCHAR(50);
ALTER TABLE "reservation" ALTER COLUMN "name" SET DATA TYPE VARCHAR(50);
