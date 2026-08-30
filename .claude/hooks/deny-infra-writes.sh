#!/usr/bin/env bash
# terraform·aws·git·데이터베이스의 쓰기 계열 호출을 차단하는 PreToolUse hook.
#
# permissions.deny의 접두사 매칭은 명령이 그 이름으로 "시작"할 때만 걸려서
# /opt/homebrew/bin/terraform apply 처럼 절대경로로 부르면 그대로 통과한다.
# 이 훅은 명령을 구분자로 쪼갠 뒤 각 조각의 실행 파일 basename을 보므로 경로·래퍼에 무관하다.
#
# 판단은 allowlist 기반(기본 거부)이다 — 읽기 전용으로 확인된 것만 통과시킨다.
# settings.json의 permissions.allow와 범위를 맞춰 둘 것.
set -uo pipefail

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
[ -z "$cmd" ] && exit 0

tf_readonly='^(version|validate|plan|show|output|graph|providers|providers[[:space:]]+schema|state[[:space:]]+(list|show|pull)|workspace[[:space:]]+(list|show))([[:space:]]|$)'

aws_readonly='^((sts[[:space:]]+get-caller-identity|ce[[:space:]]+get-|s3[[:space:]]+ls|s3api[[:space:]]+(head-|get-bucket-|list-)|route53[[:space:]]+(list-|get-)|cloudfront[[:space:]]+(list-|get-distribution)|ssm[[:space:]]+describe-parameters|(ec2|rds|elasticache|ecs|ecr|elbv2|acm|logs|ses|application-autoscaling)[[:space:]]+(describe-|list-)|cloudwatch[[:space:]]+(describe-|list-metrics|get-metric-)))'

# git은 서브커맨드가 바로 오는 것만 허용한다. -C·--git-dir·--work-tree 같은 전역 플래그가 앞에 붙으면
# 어느 패턴과도 안 맞아 자동으로 거부된다(프로젝트 밖 저장소를 건드리는 경로).
git_readonly='^(status|diff|log|show|blame|grep|rev-parse|rev-list|describe|shortlog|ls-files|ls-tree|ls-remote|cat-file|show-ref|show-branch|merge-base|name-rev|whatchanged|diff-tree|diff-index|count-objects|check-ignore|check-attr|verify-commit|verify-tag|var|version|help)([[:space:]]|$)'
git_readonly_sub='^(config[[:space:]]+(--get|--list|-l)|submodule[[:space:]]+status|worktree[[:space:]]+list|tag[[:space:]]+(--list|-l)|stash[[:space:]]+list|bisect[[:space:]]+log|notes[[:space:]]+list|reflog([[:space:]]+show)?)([[:space:]]|$)'
git_readonly_listing='^(branch|remote)([[:space:]]*$|[[:space:]]+(-a|-v|-vv|-r|--all|--verbose|--remotes|--list|--show-current|show|get-url)([[:space:]]|$))'

# SQL 클라이언트: -c/-e로 넘긴 질의가 읽기 동사로 시작할 때만 허용한다.
# 인자 없이 부르면 대화형 세션이 열려 그 안에서 무엇이든 되므로 거부한다.
sql_readonly_verb='^(SELECT|WITH|SHOW|EXPLAIN|DESC|DESCRIBE|ANALYZE[[:space:]]+SELECT)[[:space:](]'
# psql의 읽기 전용 메타 명령(\dt, \d+, \l 등)
psql_readonly_meta='^\\\\(d|dt|dv|di|ds|df|dn|dp|du|l|z|conninfo)'

# prisma는 DB를 건드리지 않는 것만 허용한다(generate는 클라이언트 코드만 생성).
prisma_readonly='^(generate|validate|version|-v|--version)([[:space:]]|$)'

# redis-cli 읽기 명령
redis_readonly='^(-[a-zA-Z][^[:space:]]*[[:space:]]+)*(GET|MGET|KEYS|SCAN|TYPE|TTL|PTTL|EXISTS|STRLEN|LLEN|LRANGE|LINDEX|HGET|HMGET|HGETALL|HKEYS|HLEN|SMEMBERS|SCARD|SISMEMBER|ZRANGE|ZCARD|ZSCORE|XLEN|XRANGE|XREVRANGE|XINFO|INFO|DBSIZE|PING|CLIENT[[:space:]]+LIST|MEMORY[[:space:]]+USAGE|OBJECT|RANDOMKEY|COMMAND|CONFIG[[:space:]]+GET)([[:space:]]|$)'

deny() {
	jq -n --arg reason "$1" '{
		hookSpecificOutput: {
			hookEventName: "PreToolUse",
			permissionDecision: "deny",
			permissionDecisionReason: $reason
		}
	}'
	exit 0
}

# --- 명령 전체를 보는 사전 검사 --------------------------------------------

# $(which git) push 처럼 명령 치환으로 바이너리 이름을 숨기는 경로.
# 치환 결과가 실행 파일이 되므로 조각 단위 basename 검사로는 잡히지 않는다.
subs=$(printf '%s' "$cmd" | grep -oE '\$\([^)]*\)|\$\{[^}]*\}|`[^`]*`' || true)
if [ -n "$subs" ] && printf '%s' "$subs" | grep -qE '(^|[[:space:]/({])(terraform|aws|git|psql|mysql|prisma|redis-cli)([[:space:]]|$|\)|\}|`)'; then
	deny "명령 치환으로 통제 대상 바이너리 경로를 구성하는 호출은 차단됩니다: $cmd"
fi

# eval은 문자열을 그대로 실행해 정적 검사를 통째로 무력화한다.
if printf '%s' "$cmd" | grep -qE '(^|[[:space:];&|(])eval([[:space:]]|$)'; then
	deny "eval은 정적 검사를 우회하므로 차단됩니다: $cmd"
fi

# 컨테이너·원격 경유로 DB 클라이언트를 부르는 경로(docker exec, kubectl exec 등).
if printf '%s' "$cmd" | grep -qE '(^|[[:space:];&|(])(docker|docker-compose|kubectl|ssh)([[:space:]])' \
	&& printf '%s' "$cmd" | grep -qE '[[:space:]](psql|mysql|mysqldump|pg_dump|pg_restore|redis-cli|prisma)([[:space:]]|$)'; then
	deny "컨테이너·원격 경유 DB 클라이언트 호출은 차단됩니다: $cmd"
fi

# DB를 변경하는 프로젝트 스크립트. pnpm --filter backend deploy 처럼 래퍼를 벗겨도
# 실행 파일 이름이 안 나오는 형태라 명령 전체에서 잡는다.
if printf '%s' "$cmd" | grep -qE '(^|[[:space:]])(db:(deploy|reset|seed|push|migrate)|docker:down)([[:space:]]|$)'; then
	deny "DB 스키마·데이터를 바꾸는 스크립트는 차단됩니다: $cmd

마이그레이션 적용과 시드는 사용자가 직접 실행해야 합니다(prisma/CLAUDE.md 규칙)."
fi
if printf '%s' "$cmd" | grep -qE '\-\-filter[=[:space:]][^[:space:]]+[[:space:]]+(deploy|migrate|seed|db:[a-z]+)([[:space:]]|$)'; then
	deny "DB 스키마·데이터를 바꾸는 워크스페이스 스크립트는 차단됩니다: $cmd"
fi

# --- 조각별 실행 파일 검사 --------------------------------------------------

segments=$(printf '%s' "$cmd" | sed -E 's/(\|\||&&|[;|&()])/\n/g')

while IFS= read -r seg; do
	# 앞쪽의 VAR=value 할당과 래퍼 단어를 벗겨 실제 실행 파일을 찾는다.
	seg="${seg#"${seg%%[![:space:]]*}"}"
	while [[ "$seg" =~ ^([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*|env|command|exec|builtin|sudo|time|nohup|xargs|nice|stdbuf|npx|bunx|pnpm[[:space:]]+exec|npm[[:space:]]+exec|yarn[[:space:]]+exec)[[:space:]]+(.*)$ ]]; do
		seg="${BASH_REMATCH[2]}"
	done

	bin="${seg%%[[:space:]]*}"
	rest="${seg#"$bin"}"
	rest="${rest#"${rest%%[![:space:]]*}"}"
	base="${bin##*/}"

	case "$base" in
		terraform)
			[[ "$rest" =~ $tf_readonly ]] && continue
			[[ "$rest" =~ ^fmt([[:space:]]|$) && "$rest" == *-check* ]] && continue
			[[ "$rest" =~ ^init([[:space:]]|$) && "$rest" == *-backend=false* ]] && continue
			deny "terraform 쓰기 명령은 차단됩니다(읽기 전용만 허용). 차단된 조각: terraform $rest

apply·destroy 등은 사용자가 직접 실행해야 합니다. 프롬프트에 ! 를 붙여 실행하면 출력이 대화에 남습니다."
			;;
		aws)
			[[ "$rest" =~ $aws_readonly ]] && continue
			deny "aws 쓰기 명령은 차단됩니다(읽기 전용만 허용). 차단된 조각: aws $rest

변경 작업은 사용자가 직접 실행해야 합니다. 프롬프트에 ! 를 붙여 실행하면 출력이 대화에 남습니다."
			;;
		git)
			[[ "$rest" =~ $git_readonly ]] && continue
			[[ "$rest" =~ $git_readonly_sub ]] && continue
			[[ "$rest" =~ $git_readonly_listing ]] && continue
			deny "git 쓰기 명령은 차단됩니다(읽기 전용만 허용). 차단된 조각: git $rest

commit·push·checkout 등 작업 트리나 히스토리를 바꾸는 명령은 사용자가 직접 실행해야 합니다."
			;;
		psql|mysql|mariadb)
			# -c(psql) / -e(mysql)로 넘긴 질의만 검사할 수 있다. 없으면 대화형이라 거부.
			q=""
			[[ "$rest" =~ (^|[[:space:]])-(c|e|-command|-execute)[=[:space:]]+[\"\']?([^\"\']*) ]] && q="${BASH_REMATCH[3]}"
			if [ -n "$q" ]; then
				qq=$(printf '%s' "$q" | tr '[:lower:]' '[:upper:]')
				qq="${qq#"${qq%%[![:space:]]*}"}"
				[[ "$qq" =~ $sql_readonly_verb ]] && continue
				[[ "$q" =~ $psql_readonly_meta ]] && continue
			fi
			deny "SELECT 계열 질의만 허용됩니다. 차단된 조각: $base $rest

쓰기 질의와 대화형 세션(-c/-e 없이 실행)은 차단됩니다.
읽기는 -c/-e 로 SELECT·WITH·SHOW·EXPLAIN·DESCRIBE 질의를 넘기거나 MCP의 query 도구를 쓰십시오."
			;;
		mysqldump|mysqladmin|pg_dump|pg_dumpall|pg_restore|pgbench|pg_ctl|createdb|dropdb|createuser|dropuser|sqlite3|mongosh|mongo)
			deny "DB 관리 도구는 차단됩니다: $base $rest

덤프·복원·계정 관리는 사용자가 직접 실행해야 합니다."
			;;
		prisma)
			[[ "$rest" =~ $prisma_readonly ]] && continue
			deny "prisma의 DB 변경 명령은 차단됩니다: prisma $rest

migrate·db push·db execute·db seed는 사용자가 직접 실행해야 합니다(prisma/CLAUDE.md 규칙).
generate·validate는 허용됩니다."
			;;
		redis-cli|valkey-cli)
			# 선행 접속 옵션을 벗겨 실제 명령 토큰을 찾는다(-n 0, -h host 처럼 값을 받는 것 포함).
			r="$rest"
			while [[ "$r" =~ ^(-[^[:space:]]+)[[:space:]]+(.*)$ ]]; do
				opt="${BASH_REMATCH[1]}"
				r="${BASH_REMATCH[2]}"
				case "$opt" in
					-h|-p|-n|-a|-u|-s|-t|--user|--pass|--socket) r="${r#*[[:space:]]}"; r="${r#"${r%%[![:space:]]*}"}" ;;
				esac
			done
			[[ "$r" =~ $redis_readonly ]] && continue
			deny "redis 쓰기 명령은 차단됩니다(읽기 전용만 허용). 차단된 조각: $base $rest"
			;;
	esac
done <<< "$segments"

exit 0
