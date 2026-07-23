#!/usr/bin/env bash
# 수정된 backend .ts 파일에 ESLint(--fix)를 실행하고 남은 오류가 있으면 block하는 PostToolUse hook
set -uo pipefail

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0

case "$file" in
	*/apps/backend/*.ts) ;;
	*) exit 0 ;;
esac

root="${CLAUDE_PROJECT_DIR:-$(printf '%s' "$input" | jq -r '.cwd // empty')}"
[ -z "$root" ] && exit 0
backend="$root/apps/backend"
rel="${file#"$backend"/}"

out=$(cd "$backend" && pnpm exec eslint --fix --no-warn-ignored "$rel" 2>&1)
status=$?
if [ "$status" -ne 0 ]; then
	jq -n --arg reason "ESLint 오류 (--fix 적용 후에도 남음): $file
$out" '{decision: "block", reason: $reason}'
fi
exit 0
