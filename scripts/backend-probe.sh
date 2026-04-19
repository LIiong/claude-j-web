#!/usr/bin/env bash
# scripts/backend-probe.sh
# 快速探测 claude-j 后端 OpenAPI 端点是否可达。
# 退出码：0=可达，1=不可达；无 stdout 噪声，可被 agent / 其他脚本静默复用。
#
# 用法：
#   ./scripts/backend-probe.sh              # 默认 http://localhost:8080
#   BACKEND_URL=http://host:8080 ./scripts/backend-probe.sh

set -u

BACKEND_URL="${BACKEND_URL:-${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8080}}"
PROBE_PATH="/v3/api-docs"
TIMEOUT="${BACKEND_PROBE_TIMEOUT:-2}"

if ! command -v curl >/dev/null 2>&1; then
  echo "backend-probe: curl not found" >&2
  exit 2
fi

http_code=$(curl -s -o /dev/null -w '%{http_code}' \
  --max-time "$TIMEOUT" \
  --connect-timeout "$TIMEOUT" \
  "${BACKEND_URL}${PROBE_PATH}" 2>/dev/null || echo "000")

case "$http_code" in
  200|204)
    exit 0
    ;;
  *)
    exit 1
    ;;
esac
