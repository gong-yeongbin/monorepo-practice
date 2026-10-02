-- 로그인 시도 기록 테이블(보안 감사용). 성공·실패를 모두 남긴다.
-- email은 입력값 그대로 저장한다 — 없는 계정에 대한 시도도 추적되고(user_id NULL), user를 삭제해도 기록은 남는다(SET NULL).

-- CreateEnum
CREATE TYPE "LoginResult" AS ENUM ('SUCCESS', 'INVALID_CREDENTIALS', 'NOT_APPROVED');

-- CreateTable
CREATE TABLE "login_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "email" VARCHAR(255) NOT NULL,
    "result" "LoginResult" NOT NULL,
    "ip" VARCHAR(45) NOT NULL,
    "user_agent" VARCHAR(512),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- 사용자별 최근 기록 조회용. PostgreSQL은 FK 인덱스를 자동 생성하지 않는다.
CREATE INDEX "login_history_user_id_created_at_idx" ON "login_history"("user_id", "created_at");

-- CreateIndex
-- "이 email로 실패가 몇 번" 집계용 — 없는 계정에 대한 시도는 user_id가 NULL이라 email로만 묶인다.
CREATE INDEX "login_history_email_created_at_idx" ON "login_history"("email", "created_at");

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
