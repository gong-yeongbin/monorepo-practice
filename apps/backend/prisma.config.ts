import { defineConfig } from 'prisma/config';

// Prisma 7: datasource URL은 더 이상 schema.prisma에 둘 수 없어 여기서 주입한다.
// migrate/introspect 실행 시 DATABASE_URL 환경변수가 필요하다.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
