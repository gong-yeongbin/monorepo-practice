-- 어드민 포스트백 로그 조회 API(인스톨·이벤트·미등록 모달) 도입에 따른 조회 인덱스.
-- postback은 그동안 삽입 전용이라 인덱스가 없었다(과거 미사용 @@index([token]) 제거 이력 참고).

-- CreateIndex
CREATE INDEX `postback_token_installed_at_idx` ON `postback`(`token`, `installed_at`);

-- CreateIndex
CREATE INDEX `postback_token_evented_at_idx` ON `postback`(`token`, `evented_at`);

-- CreateIndex
CREATE INDEX `postback_view_code_idx` ON `postback`(`view_code`);
