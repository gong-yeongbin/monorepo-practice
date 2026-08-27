-- user ↔ advertising 허용 목록(M:N)을 신설하고, 쓰이지 않던 user.advertiser_id(1:1)를 제거한다.

-- CreateTable
CREATE TABLE "user_advertising" (
    "user_id" INTEGER NOT NULL,
    "advertising_id" INTEGER NOT NULL,

    CONSTRAINT "user_advertising_pkey" PRIMARY KEY ("user_id","advertising_id")
);

-- CreateIndex
-- 복합 PK 인덱스는 선두 컬럼(user_id)만 커버한다. advertising 기준 조회·cascade용 인덱스를 따로 둔다.
CREATE INDEX "user_advertising_advertising_id_idx" ON "user_advertising"("advertising_id");

-- AddForeignKey
ALTER TABLE "user_advertising" ADD CONSTRAINT "user_advertising_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_advertising" ADD CONSTRAINT "user_advertising_advertising_id_fkey" FOREIGN KEY ("advertising_id") REFERENCES "advertising"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 데이터 이관: advertiser_id가 채워진 행이 있으면 그 광고주의 advertising 전부를 허용 목록으로 옮긴다.
-- advertiser 1:N advertising이라 손실 없는 확장 변환이다. 코드상 advertiser_id에 값을 넣는 경로가 없어
-- 실무상 0건(no-op)이지만, 로컬에서 손으로 넣은 값이 컬럼 drop과 함께 조용히 사라지는 것을 막는다.
INSERT INTO "user_advertising" ("user_id", "advertising_id")
SELECT u."id", a."id"
FROM "user" u
JOIN "advertising" a ON a."advertiser_id" = u."advertiser_id"
WHERE u."advertiser_id" IS NOT NULL
ON CONFLICT DO NOTHING;

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_advertiser_id_fkey";

-- DropIndex
DROP INDEX "user_advertiser_id_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "advertiser_id";
