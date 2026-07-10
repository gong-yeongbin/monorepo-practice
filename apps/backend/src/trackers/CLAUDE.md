# trackers

외부 MMP/트래커(appsflyer, airbridge, adjust, adbrix-remaster)의 서로 다른 query 파라미터를 우리 내부 표준 형태로 변환하는 anti-corruption 계층. class-transformer 매핑은 **이 경계 안에만** 두고 바깥(use-case)에는 순수 함수로만 노출한다.

## 구조

- `tracker.types.ts` — 모든 트래커가 공유하는 표준 필드(`TrackerPostback`, `TrackerEventPostback`)와 `TrackerDefinition` 타입.
- `tracker.registry.ts` — `TRACKERS` 레지스트리와 `TRACKER_NAMES`. class-transformer를 순수 함수로 감싸 노출한다.
- `<트래커>/` — 트래커별 mapper 3개: `tracking.mapper.ts`(클릭 리다이렉트용), `install.mapper.ts`, `event.mapper.ts`(포스트백용).

## mapper 규칙

각 mapper는 class-transformer 데코레이터로 트래커의 원본 파라미터명을 표준 필드로 매핑하는 클래스다.

- `@Expose({ name: '원본_파라미터명' })`로 이름을 표준 필드(camelCase)에 매핑.
- 쿼리 값이 배열로 들어올 수 있어 `@Transform(({ value }) => Array.isArray(value) ? value[0] : value)`로 첫 값을 취하는 패턴이 반복된다.
- 시간 필드는 트래커별 포맷(unix초 등)을 `dayjs`로 파싱해 `utcOffset(540)`(KST) 기준 ISO로 정규화한다.
- `install`/`event` mapper는 `TrackerPostback`/`TrackerEventPostback`이 요구하는 필드를 반드시 채워야 한다.

## 새 트래커 추가 (2단계)

1. `trackers/<이름>/`에 `tracking.mapper.ts`, `install.mapper.ts`, `event.mapper.ts`를 만든다(기존 트래커 복사 후 파라미터명만 수정).
2. `tracker.registry.ts`의 `TRACKERS`에 한 줄 등록한다.

`TRACKER_NAMES`는 컨트롤러의 `@IsIn(TRACKER_NAMES)` 검증에 쓰이므로, 등록만 하면 라우팅·검증이 자동으로 붙는다. use-case는 검증된 `name`으로 `TRACKERS[name]!.install(query)`를 호출한다.

## 규칙

- import 별칭은 `@trackers/*`.
- 트래커 폴더 밖(모듈 계층)에서 `plainToInstance`나 트래커 mapper 클래스를 직접 쓰지 않는다. 반드시 `TRACKERS` 레지스트리의 함수를 거친다.
