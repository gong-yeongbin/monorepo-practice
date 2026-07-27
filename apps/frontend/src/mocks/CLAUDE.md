# mocks

MSW(Mock Service Worker) 목 API. 개발 모드에서 켜지지만(`app/index.tsx`의 `worker.start({ onUnhandledRequest: 'bypass' })`), **backend에 없는 엔드포인트만 목킹한다**. 핸들러에 없는 요청은 워커를 통과해 실제 backend(`VITE_API_URL`, 로컬 3001)로 간다.

## 파일

- `handlers.ts` — 목 응답 정의. backend에 아직 없는 경로만 목킹한다 — `GET /profile`, `PATCH /advertising/:id`(상태 토글), `PATCH /campaigns/:id/block`, `GET /advertising/dailydetail`, `/reservation/*` 4종, `GET /install|event|unregistered/:tracker`(로그 모달), `GET /:eventType/:tracker/excel`, `POST /fileupload/:id`, `POST /users`.
- `browser.ts` — `setupWorker(...handlers)`로 워커 생성. `app/index.tsx`가 이 `worker`를 start 한다.
- 워커 스크립트(`mockServiceWorker.js`)는 `public/`에 있다(`package.json`의 `msw.workerDirectory: "public"`).

## 주의

- 위 목 엔드포인트가 backend에 구현되면 여기 핸들러를 지워야 실제 응답이 화면에 나온다.
- 새 API를 화면에서 쓰기 시작했는데 backend에 아직 없으면 여기 핸들러를 추가해야 한다. 쿼리 에러가 나면 전역 `QueryCache.onError`가 세션을 비우고 `/login`으로 보내므로, 목 없이 404가 나면 앱 전체가 사용 불가가 된다. 응답 shape은 실제 API와 맞춰야 한다(대개 `{ data: ... }` 래핑).
