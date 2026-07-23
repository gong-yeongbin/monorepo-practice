#!/usr/bin/env bash
# 턴 종료 시 backend 변경이 있으면 tsc·jest를 실행해 실패하면 종료를 차단하는 Stop hook
set -uo pipefail

input=$(cat)
active=$(printf '%s' "$input" | jq -r '.stop_hook_active // false')
[ "$active" = "true" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-$(printf '%s' "$input" | jq -r '.cwd // empty')}"
[ -z "$root" ] && exit 0
cd "$root" || exit 0

changes=$(git status --porcelain -- apps/backend/src apps/backend/test 2>/dev/null)
[ -z "$changes" ] && exit 0

fail() {
	jq -n --arg reason "$1" '{decision: "block", reason: $reason}'
	exit 0
}

tsc_out=$(pnpm --filter backend exec tsc --noEmit 2>&1) || fail "backend type-check 실패 (tsc --noEmit):
$(printf '%s' "$tsc_out" | tail -n 40)"

test_out=$(pnpm --filter backend test 2>&1) || fail "backend 테스트 실패 (jest):
$(printf '%s' "$test_out" | tail -n 60)"

exit 0
