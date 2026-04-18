#!/bin/bash
# =================================================================
# post-commit-check.sh — PostToolUse Hook: commit 后质量检查（TS 版）
# 包含 src/ 下 TS/TSX 变更的 commit：失败时 exit 2 阻断
# 仅包含非业务文件的 commit：失败时仅警告（非阻断）
# =================================================================

set -uo pipefail

cd "$(dirname "$0")/../.."

if [ ! -f "./scripts/quick-check.sh" ]; then
    exit 0
fi

HAS_TS=$(git diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null \
    | grep -E "^src/.*\.(ts|tsx)$" \
    | grep -vE "\.(test|spec)\.(ts|tsx)$" \
    || true)

echo "--- Post-Commit Quick Check ---" >&2

if ./scripts/quick-check.sh >/dev/null 2>&1; then
    echo "✅ Post-commit quick-check 通过" >&2
    exit 0
fi

if [ -n "$HAS_TS" ]; then
    echo "❌ Post-commit quick-check 失败（包含 TS 业务代码变更）" >&2
    echo "   请运行 ./scripts/quick-check.sh 查看详情并修复后重新提交" >&2
    echo "   提示：修复后创建新 commit，不要 amend" >&2
    exit 2
fi

echo "⚠️ Post-commit quick-check 失败（非业务代码变更，不阻断）" >&2
exit 0
