---
paths:
  - "apps/backend/src/modules/**/*.controller.ts"
---

# backend RESTful 엔드포인트 작성 규칙

## 리소스 네이밍

- URL 리소스 세그먼트는 **복수형 명사**를 쓴다 — `/campaigns`, `/advertisers`, `/users`, `/trackers`, `/partners`, `/media`(medium의 복수형).
- 불가산 명사는 그대로 쓴다 — `/advertising`.
- **URL에 동사를 넣지 않는다.** 행위는 HTTP 메서드로 표현한다 — `POST /campaigns`(○), `/campaign/create`(×).

## HTTP 메서드

- `GET` — 조회. 컬렉션은 `GET /campaigns`, 단건은 `GET /campaigns/:id`. 부수효과 금지.
- `POST` — 생성. 성공 시 201.
- `PATCH` — **부분 수정**(전달한 필드만 갱신).
- `PUT` — **전체 교체**(모든 필드 필수). 예: `PUT /advertising/:id`.
- `DELETE` — 삭제.

## 허용 예외 (변경 금지)

- **auth** — `POST /auth/signup`, `POST /auth/signup/verify`, `POST /auth/signin`, `POST /auth/refresh`, `GET /auth/email-availability`. 인증 플로우는 관례적으로 동사 경로를 허용한다.
- **tracking·postback** — `GET /tracking`, `GET /:name/install`, `GET /:name/event`. 외부 트래커에 이미 배포된 공개 URL이므로 형태를 바꾸지 않는다.
- **싱글턴·뷰 리소스** — `GET /dashboard`(집계 뷰), `GET·PATCH /config/:campaignId`(campaign당 하나의 설정)는 복수형을 강제하지 않는다.

## 함께 지킬 것

- 컨트롤러 클래스·모듈·폴더명은 단수형을 유지하고 URL만 복수형으로 쓴다. 예: `CampaignController` + `@Controller('campaigns')`.
- `@ApiTags`는 컨트롤러 prefix와 같은 문자열을 쓴다.
- 엔드포인트를 추가·변경하면 `apps/backend/http/`의 해당 `.http` 파일과 `apps/backend/README.md`의 라우트 표를 함께 갱신한다.
