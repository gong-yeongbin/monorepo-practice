import { defineConfig } from 'prisma/config';

// Prisma 7: datasource URL은 더 이상 schema.prisma에 둘 수 없어 여기서 주입한다.
// migrate/introspect 실행 시 DATABASE_URL 환경변수가 필요하다.
// prisma.config.ts가 있으면 CLI가 .env를 자동 로드하지 않으므로 여기서 직접 읽는다(.env 없는 환경은 무시).
try {
  process.loadEnvFile();
} catch {
  // .env가 없으면 셸 환경변수의 DATABASE_URL을 그대로 사용
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
