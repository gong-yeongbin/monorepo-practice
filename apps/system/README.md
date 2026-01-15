# System API

트래킹 및 포스트백 처리를 위한 시스템 API 서버입니다. 다양한 트래킹 솔루션으로부터의 트래킹 데이터를 수신하고, 매체사로 포스트백을 전송합니다.

## 기술 스택

- **Framework**: NestJS 11.x
- **Message Queue**: Kafka (KafkaJS)
- **Cache**: Redis (Keyv)
- **HTTP Client**: Express
- **Language**: TypeScript

## 프로젝트 구조

```
src/
├── main.ts                    # 애플리케이션 진입점
├── app.module.ts              # 루트 모듈
├── common/                    # 공통 유틸리티
│   └── util/                  # 유틸리티 함수
├── core/                      # 핵심 모듈
│   ├── cache/                 # 캐시 모듈 (Redis)
│   └── kafka/                 # Kafka 모듈
└── module/                    # 기능 모듈
    ├── postback/              # 포스트백 처리
    └── tracking/              # 트래킹 처리
```

## 주요 기능

### 트래킹 처리
다양한 트래킹 솔루션으로부터의 트래킹 데이터를 수신하고 처리합니다:

- **AppsFlyer**: AppsFlyer 트래킹 데이터 처리
- **Adjust**: Adjust 트래킹 데이터 처리
- **Airbridge**: Airbridge 트래킹 데이터 처리
- **AdbrixRemaster**: AdbrixRemaster 트래킹 데이터 처리

### 포스트백 처리
매체사로 포스트백을 전송합니다:

- **Install Postback**: 설치 이벤트 포스트백
- **Event Postback**: 커스텀 이벤트 포스트백

### 메시지 큐 처리
- Kafka를 통한 비동기 메시지 처리
- Producer: 트래킹 데이터를 Kafka로 전송
- Consumer: Kafka에서 메시지를 수신하여 처리

### 캐시 관리
- Redis를 사용한 캐시 관리
- 트래킹 데이터 임시 저장
- 성능 최적화

## 설치 및 실행

### 의존성 설치

```bash
pnpm install
```

### 개발 환경 실행

```bash
# 개발 모드 (watch 모드)
pnpm run dev

# 디버그 모드
pnpm run start:debug

# 프로덕션 모드
pnpm run start:prod
```

### 빌드

```bash
pnpm run build
```

## 환경 변수

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Kafka
KAFKA_BROKERS="localhost:9092"
KAFKA_CLIENT_ID="system-api"
KAFKA_GROUP_ID="system-api-group"

# Redis
REDIS_URL="redis://localhost:6379"

# 서버
PORT=3001
```

## API 엔드포인트

### 트래킹 엔드포인트

#### AppsFlyer
```
POST /tracking/appsflyer
```

#### Adjust
```
POST /tracking/adjust
```

#### Airbridge
```
POST /tracking/airbridge
```

#### AdbrixRemaster
```
POST /tracking/adbrixremaster
```

### 포스트백 엔드포인트

#### Install Postback
```
POST /postback/install
```

#### Event Postback
```
POST /postback/event
```

## 아키텍처

### 메시지 흐름

1. **트래킹 데이터 수신**
   - 외부 트래킹 솔루션에서 HTTP 요청 수신
   - 데이터 검증 및 정규화
   - Kafka Producer를 통해 메시지 전송

2. **Kafka Consumer 처리**
   - Kafka에서 메시지 수신
   - 비즈니스 로직 처리
   - 데이터베이스 저장
   - 포스트백 전송 (필요 시)

3. **포스트백 전송**
   - 매체사로 HTTP POST 요청
   - 재시도 로직
   - 실패 시 큐에 재등록

### 캐시 전략

- 트래킹 데이터 임시 저장 (중복 방지)
- 자주 조회되는 데이터 캐싱
- TTL 설정을 통한 자동 만료

## 모듈 상세

### Postback Module
- Install Postback 처리
- Event Postback 처리
- 포스트백 전송 및 재시도 로직
- Kafka Producer 인터셉터

### Tracking Module
- 다양한 트래킹 솔루션 지원
- 트래킹 데이터 정규화
- 일일 통계 집계
- Kafka Producer 인터셉터

### Kafka Module
- Producer: 메시지 전송
- Consumer: 메시지 수신 및 처리
- 토픽 관리
- 에러 핸들링

### Cache Module
- Redis 캐시 관리
- Key-value 저장소
- TTL 관리

## 테스트

```bash
# 단위 테스트
pnpm run test

# E2E 테스트
pnpm run test:e2e

# 커버리지
pnpm run test:cov

# Watch 모드
pnpm run test:watch
```

## 코드 포맷팅 및 린트

```bash
# 코드 포맷팅
pnpm run format

# 린트
pnpm run lint
```

## 메시지 큐 설정

### Kafka 토픽

시스템에서 사용하는 주요 토픽:

- `tracking` - 트래킹 데이터
- `postback` - 포스트백 처리 요청
- `daily-statistic` - 일일 통계 집계

### Consumer Group

- 각 모듈별 독립적인 Consumer Group 사용
- 수평 확장 지원

## 성능 최적화

- 비동기 메시지 처리로 응답 시간 단축
- Redis 캐싱으로 데이터베이스 부하 감소
- Kafka를 통한 분산 처리
- 배치 처리로 대량 데이터 처리

## 모니터링

- Kafka 메시지 처리 모니터링
- Redis 캐시 히트율 모니터링
- 포스트백 전송 성공률 모니터링
- 에러 로깅 및 알림

## 라이선스

UNLICENSED
