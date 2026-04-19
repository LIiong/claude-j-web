#!/usr/bin/env bash
# scripts/api-sync.sh
# 同步 claude-j 后端 OpenAPI schema 到 src/shared/api/generated/。
#
# 退出码：
#   0  = 同步成功（schema 未变 或 已更新到最新）
#   10 = 后端不可达
#   20 = schema 漂移（本次拉到的 schema 与上次 .schema.sha256 记录不同；供 @qa 在 Verify 阶段检测 Spec 后漂移）
#   30 = openapi-typescript 生成失败
#
# 产物：
#   src/shared/api/generated/schema.d.ts      — 类型定义（.gitignore 中）
#   src/shared/api/generated/.schema.sha256   — 当前 schema 的 sha256（可提交以追踪漂移）
#   src/shared/api/generated/.schema.meta.json — 时间戳 / 来源 URL / 后端 git SHA（若可读）
#
# 用法：
#   ./scripts/api-sync.sh                 # 正常同步
#   ./scripts/api-sync.sh --check-drift   # 仅对比 sha，不写文件；用于 @qa Verify 阶段

set -u

BACKEND_URL="${BACKEND_URL:-${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8080}}"
SCHEMA_PATH="/v3/api-docs"
INFO_PATH="/actuator/info"

GEN_DIR="src/shared/api/generated"
SCHEMA_FILE="${GEN_DIR}/schema.d.ts"
SHA_FILE="${GEN_DIR}/.schema.sha256"
META_FILE="${GEN_DIR}/.schema.meta.json"

CHECK_DRIFT_ONLY=0
if [[ "${1:-}" == "--check-drift" ]]; then
  CHECK_DRIFT_ONLY=1
fi

log() { echo "[api-sync] $*" >&2; }

# --- 1. probe 后端 ---
probe_script="$(dirname "$0")/backend-probe.sh"
if [[ -x "$probe_script" ]]; then
  if ! BACKEND_URL="$BACKEND_URL" "$probe_script"; then
    log "后端不可达：${BACKEND_URL}${SCHEMA_PATH}"
    log "hint: export USE_MOCK=1 to work offline against MSW handlers"
    exit 10
  fi
else
  log "WARN: backend-probe.sh 不可执行，跳过 probe"
fi

# --- 2. 拉 schema JSON ---
tmp_schema_json=$(mktemp)
trap 'rm -f "$tmp_schema_json"' EXIT

if ! curl -sSf --max-time 10 "${BACKEND_URL}${SCHEMA_PATH}" -o "$tmp_schema_json"; then
  log "拉取 schema 失败：${BACKEND_URL}${SCHEMA_PATH}"
  exit 10
fi

# --- 3. 计算 sha256 ---
if command -v sha256sum >/dev/null 2>&1; then
  new_sha=$(sha256sum "$tmp_schema_json" | awk '{print $1}')
elif command -v shasum >/dev/null 2>&1; then
  new_sha=$(shasum -a 256 "$tmp_schema_json" | awk '{print $1}')
else
  log "sha256sum / shasum 均不可用"
  exit 30
fi

old_sha=""
if [[ -f "$SHA_FILE" ]]; then
  old_sha=$(tr -d '[:space:]' < "$SHA_FILE")
fi

# --- 4. drift-only 模式 ---
if [[ "$CHECK_DRIFT_ONLY" == "1" ]]; then
  if [[ -z "$old_sha" ]]; then
    log "无历史 sha 记录，无法 drift 检测；请先正常跑一次 api-sync.sh"
    exit 20
  fi
  if [[ "$new_sha" != "$old_sha" ]]; then
    log "SCHEMA DRIFT DETECTED"
    log "  old: ${old_sha:0:12}"
    log "  new: ${new_sha:0:12}"
    exit 20
  fi
  log "schema 一致：${new_sha:0:12}"
  exit 0
fi

# --- 5. 正常同步：生成 TS 类型 ---
mkdir -p "$GEN_DIR"

if ! command -v pnpm >/dev/null 2>&1; then
  log "pnpm 不可用"
  exit 30
fi

if ! pnpm exec openapi-typescript "${BACKEND_URL}${SCHEMA_PATH}" -o "$SCHEMA_FILE" 2>&1 | sed 's/^/[openapi-typescript] /' >&2; then
  log "openapi-typescript 生成失败"
  exit 30
fi

# --- 6. 写 .schema.sha256 ---
drift_flag=0
if [[ -n "$old_sha" && "$new_sha" != "$old_sha" ]]; then
  drift_flag=1
  log "schema 已更新：${old_sha:0:12} → ${new_sha:0:12}"
else
  log "schema 未变：${new_sha:0:12}"
fi
echo "$new_sha" > "$SHA_FILE"

# --- 7. 写 .schema.meta.json ---
backend_sha=""
if backend_info=$(curl -sS --max-time 3 "${BACKEND_URL}${INFO_PATH}" 2>/dev/null); then
  backend_sha=$(echo "$backend_info" | grep -oE '"commit"[[:space:]]*:[[:space:]]*\{[^}]*"id"[[:space:]]*:[[:space:]]*"[^"]*"' \
                | grep -oE '"id"[[:space:]]*:[[:space:]]*"[^"]*"' \
                | grep -oE '"[a-f0-9]+"$' | tr -d '"' || true)
fi

timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat > "$META_FILE" <<EOF
{
  "schema_sha256": "$new_sha",
  "schema_sha_short": "${new_sha:0:12}",
  "source_url": "${BACKEND_URL}${SCHEMA_PATH}",
  "synced_at": "$timestamp",
  "backend_git_sha": "${backend_sha}",
  "previous_sha256": "$old_sha"
}
EOF

log "写入 ${META_FILE}"

# 标记本 session 内已同步（供 guard-api-sync.sh 放行）
mkdir -p ".claude" 2>/dev/null || true
touch ".claude/.api-sync-session" 2>/dev/null || true

# --- 8. drift 报告（不阻断退出码；由 @qa 在 --check-drift 模式用 exit 20 阻断）---
if [[ "$drift_flag" == "1" ]]; then
  log "SCHEMA DRIFT DETECTED（相对上次同步）"
  log "若本次 Spec 尚未基于新 schema，请更新 requirement-design.md 的 API 契约章节"
fi

exit 0
