# common

앱 어느 계층에서나 쓰는 순수 유틸. NestJS 의존성(`@Injectable`, DI)이 없는 무상태 함수만 둔다. 상태나 외부 연결(Redis, Prisma)이 필요하면 `common`이 아니라 `infra`로 간다.

## 규칙

- 함수는 named export로 노출한다. 클래스나 프로바이더를 만들지 않는다.
- import 별칭은 `@common/*` (예: `import { viewCodeCodec } from '@common/utils/view-code.util'`).
- 여러 모듈이 실제로 공유할 때만 여기에 둔다. 한 모듈에서만 쓰는 헬퍼는 그 모듈 폴더에 둔다.

## 기존 유틸 (동작 주의)

- `date.util.ts` — `kstBaseDate()`는 서버 타임존과 무관하게 **KST 기준 오늘**을 UTC 자정 `Date`로 반환한다. `daily_report.created_date`가 `@db.Date`라 이 형태를 기대한다. 날짜 집계 키를 만들 때 `new Date()` 대신 이걸 쓴다.
- `view-code.util.ts` — `viewCodeCodec.encode/decode`는 viewCode를 AES-128-CBC로 다룬다. 복호화된 viewCode는 `광고코드:pubId:subId` 형태이며 `.split(':')`으로 분해한다(use-case에서 사용). `decode`는 실패 시 던지지 않고 입력값을 그대로 반환한다.
