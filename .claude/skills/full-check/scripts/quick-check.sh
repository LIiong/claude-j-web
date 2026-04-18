#!/bin/bash
# =================================================================
# quick-check.sh — 快速检查（TypeScript 版）
# 1. TypeScript 类型检查（tsc --noEmit）
# 2. Biome lint
# 3. Vitest 单测
# =================================================================

set -euo pipefail

PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$PROJECT_ROOT"

# 若 pnpm 未安装，优雅退出（允许 .claude/ 环境先准备再装依赖）
if ! command -v pnpm >/dev/null 2>&1; then
    echo "⚠️  pnpm 未安装，跳过 quick-check（请安装 pnpm 后重跑）"
    exit 0
fi

# 若 node_modules 缺失（首次拉仓库），提示但不阻断
if [ ! -d node_modules ]; then
    echo "⚠️  node_modules 不存在，跳过 quick-check（请先 pnpm install）"
    exit 0
fi

echo "=== 1/3: TypeScript 类型检查 ==="
pnpm -s exec tsc --noEmit

echo "=== 2/3: Biome lint ==="
pnpm -s exec biome check src tests 2>/dev/null || {
    echo "Biome check 失败或未配置" >&2
    exit 1
}

echo "=== 3/3: Vitest 单测 ==="
pnpm -s exec vitest run --passWithNoTests

echo "✅ quick-check 通过"
