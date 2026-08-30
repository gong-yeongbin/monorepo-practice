# 빌드 컨텍스트는 모노레포 루트다(pnpm 워크스페이스 lockfile이 루트에 있다).
#   docker build -f apps/backend/Dockerfile -t <ecr>/mecross-backend:<tag> .
#
# Fargate 태스크가 ARM64(Graviton)라 이미지도 arm64여야 한다 — x86 이미지를 push하면
# 태스크가 exec format error로 죽는다. Apple Silicon에서 빌드하면 기본이 arm64다.
FROM --platform=linux/arm64 node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

FROM base AS build
WORKDIR /repo

# 매니페스트만 먼저 복사해 install 레이어를 캐시한다 — 소스만 바뀌면 install을 건너뛴다.
# frozen-lockfile이 워크스페이스 전체를 대조하므로 쓰지 않는 워크스페이스의 package.json도 필요하다.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/typescript-config/package.json packages/typescript-config/
RUN pnpm install --frozen-lockfile --filter backend...

COPY apps/backend apps/backend
COPY packages packages

# nest build가 생성된 Prisma 클라이언트의 타입을 참조하므로 build보다 먼저 generate한다.
RUN pnpm --filter backend run generate
RUN pnpm --filter backend run build

# 런타임 의존성만 담긴 자립형 트리를 만든다 — dev 의존성이 빠지고 pnpm 심볼릭 링크도 풀린다.
RUN pnpm --filter backend deploy --prod /app

# deploy 트리에 클라이언트를 다시 생성한다. generate 산출물은 pnpm 가상 스토어
# (node_modules/.pnpm/@prisma+client@*/node_modules/.prisma) 안에 놓여서 deploy가 옮기지 못한다.
# CLI는 dev 의존성이라 /app에 없으므로 빌드 스테이지의 바이너리를 직접 부른다.
RUN cd /app && /repo/apps/backend/node_modules/.bin/prisma generate

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app ./
USER node

# 3001 어드민 API(ALB), 3002 트래킹·포스트백(NLB). 실제 값은 ECS가 PORT·TRACKING_PORT로 주입한다.
EXPOSE 3001 3002

# APP_ROLE을 주입하지 않으면 기본값 'all' — 한 프로세스가 API·트래킹·스트림 소비를 모두 맡는다.
CMD ["node", "dist/main"]
