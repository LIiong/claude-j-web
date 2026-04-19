#!/usr/bin/env bash
# scripts/hooks/guard-api-sync.sh
# PreToolUse Hook：当 agent 即将写入后端契约相关文件时，检查 schema 同步新鲜度。
#
# 触发范围（必须先跑过 api-sync.sh 且 .schema.sha256 新鲜）：
#   src/features/*/api/**/*.ts
#   src/shared/api/client.ts
#   src/shared/api/schemas/**/*.ts
#   src/features/*/api/**/*.test.ts
#
# 新鲜度判定：
#   1. src/shared/api/generated/.schema.sha256 存在
#   2. .claude/.api-sync-session 存在（本会话内至少跑过一次 api-sync.sh）
#      或 .schema.sha256 的 mtime ≤ 7 天
#
# 退出码：
#   0 = 放行
#   2 = 阻断（返回给 Claude Code Hook 协议触发拒绝）

set -u

PAYLOAD="${CLAUDE_HOOK_PAYLOAD:-}"
if [[ -z "$PAYLOAD" ]]; then
  PAYLOAD=$(cat 2>/dev/null || true)
fi

extract_path() {
  echo "$1" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 \
    | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/'
}

target_path=$(extract_path "$PAYLOAD")

# 不是 Edit/Write / 无 path → 放行
[[ -z "$target_path" ]] && exit 0

# 只拦截后端契约相关路径
case "$target_path" in
  */src/features/*/api/*.ts|*/src/shared/api/client.ts|*/src/shared/api/schemas/*)
    ;;
  *)
    exit 0
    ;;
esac

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
SHA_FILE="$PROJECT_DIR/src/shared/api/generated/.schema.sha256"
SESSION_FLAG="$PROJECT_DIR/.claude/.api-sync-session"

if [[ ! -f "$SHA_FILE" ]]; then
  cat >&2 <<EOF
[guard-api-sync] 阻断：未找到 .schema.sha256
  path: $target_path
  修复：./scripts/api-sync.sh
  （若后端不可达，先用 USE_MOCK=1 模式并在 handoff.backend-sync.sync-mode 写 mock）
EOF
  exit 2
fi

# 本 session 内跑过 api-sync.sh → 放行
if [[ -f "$SESSION_FLAG" ]]; then
  exit 0
fi

# 退而求其次：sha 文件 mtime 新鲜度
now=$(date +%s)
if [[ "$(uname)" == "Darwin" ]]; then
  mtime=$(stat -f %m "$SHA_FILE")
else
  mtime=$(stat -c %Y "$SHA_FILE")
fi
age_days=$(( (now - mtime) / 86400 ))

if (( age_days > 7 )); then
  cat >&2 <<EOF
[guard-api-sync] 阻断：.schema.sha256 陈旧（${age_days} 天未更新）
  path: $target_path
  修复：./scripts/api-sync.sh
EOF
  exit 2
fi

exit 0
