# mocks

MSW(Mock Service Worker) 목 API. **개발 모드에서 항상 켜진다** — `app/index.tsx`가 `import.meta.env.DEV`일 때 `worker.start()`를 호출하므로, `pnpm dev`로 띄우면 API 요청이 실제 backend가 아니라 여기 핸들러로 간다.

## 파일

- `handlers.ts` — 목 응답 정의. `VITE_API_URL` 기준으로 backend 엔드포인트를 가로챈다. 현재 목킹하는 경로 — `POST /login`, `GET /advertising/dashboard`, `/profile`, `/advertising/list`, `/advertising`, `/advertising/:id`, `/campaign/:id`, `/advertising/campaign/:id`, `/campaign/:id/event`.
- `browser.ts` — `setupWorker(...handlers)`로 워커 생성. `app/index.tsx`가 이 `worker`를 start 한다.
- 워커 스크립트(`mockServiceWorker.js`)는 `public/`에 있다(`package.json`의 `msw.workerDirectory: "public"`).

## 주의

- **실제 backend에 붙이려면** `index.tsx`의 `worker.start()` 조건을 끄거나 우회해야 한다. 안 그러면 DB에 데이터를 넣어도 화면엔 목 데이터가 나온다.
- 새 API를 화면에서 쓰기 시작하면, 실제 backend가 없거나 목으로 개발할 경우 여기 핸들러도 추가해야 한다. 응답 shape은 실제 API와 맞춰야 컴포넌트가 깨지지 않는다(대개 `{ data: ... }` 래핑).
