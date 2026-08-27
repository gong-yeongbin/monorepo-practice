-- AlterEnum
-- PostgreSQL은 ALTER TYPE ... DROP VALUE를 지원하지 않으므로
-- 새 타입 생성 → 컬럼 변환(값 이관 포함) → 기존 타입 drop → rename 순서로 교체한다.
BEGIN;

-- 값 순서는 schema.prisma의 enum Role과 같아야 한다(Prisma drift 감지가 variant 순서를 비교한다).
CREATE TYPE "Role_new" AS ENUM ('DEVELOPER', 'ADMIN', 'USER');

-- DEFAULT는 구 타입('ADMIN'::"Role")에 묶여 있어 타입 변환 전에 반드시 떼어낸다.
-- (남겨 두면 default for column "role" cannot be cast automatically 로 실패한다)
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;

-- 제거되는 값(ADVERTISER·MEDIA)을 쓰던 행은 최소 권한인 USER로 내린다.
-- 구 타입에는 'USER'가 없어 사전 UPDATE가 불가능하므로 USING 절 안에서 text를 거쳐 변환한다.
ALTER TABLE "user"
	ALTER COLUMN "role" TYPE "Role_new"
	USING (CASE WHEN "role"::text IN ('ADVERTISER', 'MEDIA') THEN 'USER' ELSE "role"::text END::"Role_new");

ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";

-- 가입 직후 계정은 최소 권한 + approved=false 로 시작한다.
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'USER';

COMMIT;
