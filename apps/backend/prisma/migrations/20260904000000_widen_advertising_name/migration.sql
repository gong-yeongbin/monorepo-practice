-- advertising.name을 30 → 50으로 확대.
-- 프론트가 광고명에 " (AOS)" / " (iOS)" 접미사 6자를 붙여 저장하므로 실질 입력 가능 길이가 24자에 그쳤고,
-- 초과 시 Postgres 길이 오류가 500으로 떨어져 화면에서는 로그인 화면으로 튕기는 증상으로 나타났다.

ALTER TABLE "advertising" ALTER COLUMN "name" SET DATA TYPE VARCHAR(50);
