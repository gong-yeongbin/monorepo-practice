#!/usr/bin/env bash
# backend 엔드포인트 파일(controller·dto) 수정 시 체크리스트 컨텍스트를 주입하는 PostToolUse hook
set -uo pipefail

file=$(jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0

case "$file" in
	*/apps/backend/src/modules/*.controller.ts | */apps/backend/src/modules/*/dto/*.ts)
		cat <<'EOF'
{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"backend 엔드포인트 파일이 수정됨. 확인할 것: ① Swagger 데코레이터(@ApiOperation/@ApiResponse 등) ② apps/backend/http/의 해당 .http 파일 갱신 ③ spec 테스트를 소스와 같은 폴더에 작성(modules 커버리지 4지표 90%) ④ DTO validation(class-validator)"}}
EOF
		;;
esac
exit 0
