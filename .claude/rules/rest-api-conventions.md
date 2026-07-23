---
paths:
  - "**/*.controller.ts"
---

# RESTful 엔드포인트 작성 규칙

## 리소스 네이밍

- URL 리소스 세그먼트는 **복수형 명사**를 쓴다 — `/users`, `/orders`, `/products`.
- 불가산 명사·불규칙 복수형은 사전 기준을 따른다 — `/advertising`, `/media`(medium의 복수형).
- **URL에 동사를 넣지 않는다.** 행위는 HTTP 메서드로 표현한다 — `POST /orders`(○), `/order/create`(×).

## HTTP 메서드

- `GET` — 조회. 컬렉션은 `GET /resources`, 단건은 `GET /resources/:id`. 부수효과 금지.
- `POST` — 생성. 성공 시 201.
- `PATCH` — **부분 수정**(전달한 필드만 갱신).
- `PUT` — **전체 교체**(모든 필드 필수).
- `DELETE` — 삭제.

## 허용 예외

- **인증 플로우** — `POST /auth/signup`, `POST /auth/signin`, `POST /auth/refresh` 등은 관례적으로 동사 경로를 허용한다.
- **외부에 이미 배포된 공개 URL** — 외부 시스템이 호출 중인 URL은 형태를 바꾸지 않는다.
- **싱글턴·뷰 리소스** — 집계 뷰(`GET /dashboard`)나 부모당 하나뿐인 리소스(`GET·PATCH /config/:parentId`)는 복수형을 강제하지 않는다.

## 함께 지킬 것

- 컨트롤러 클래스·모듈·폴더명은 단수형을 유지하고 URL만 복수형으로 쓴다. 예: `OrderController` + `@Controller('orders')`.
- `@ApiTags`는 컨트롤러 prefix와 같은 문자열을 쓴다.
- 엔드포인트를 추가·변경하면 관련 문서를 함께 갱신한다. 예: `.http` 호출 파일, README의 라우트 표.
