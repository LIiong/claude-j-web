#!/bin/bash
# =================================================================
# 项目环境一键搭建脚本
# 用法: ./scripts/setup.sh
# =================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd "$(dirname "$0")/.."

echo "============================================"
echo "  claude-j-web 环境搭建"
echo "============================================"
echo ""

# ------ 1. 检查 Node.js ------
echo "--- [1/4] 检查 Node.js ---"
if ! command -v node &> /dev/null; then
    echo -e "${RED}FAIL${NC}: 未找到 node 命令。请安装 Node.js 20+。"
    exit 1
fi

NODE_MAJOR=$(node -v | sed 's/^v//' | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 20 ] 2>/dev/null; then
    echo -e "${RED}FAIL${NC}: Node.js 版本过低 ($(node -v))，需要 20+。"
    exit 1
fi
echo -e "${GREEN}PASS${NC}: Node.js $(node -v)"

# ------ 2. 检查 pnpm ------
echo "--- [2/4] 检查 pnpm ---"
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}FAIL${NC}: 未找到 pnpm 命令。请 npm i -g pnpm 安装 pnpm 9+。"
    exit 1
fi
echo -e "${GREEN}PASS${NC}: pnpm $(pnpm -v)"

# ------ 3. 配置 Git Hooks ------
echo "--- [3/4] 配置 Git Hooks ---"
if [ -d ".git" ]; then
    git config core.hooksPath scripts/githooks
    echo -e "${GREEN}PASS${NC}: Git hooks 路径已配置 → scripts/githooks"
    echo "  已启用的 hooks:"
    for hook in scripts/githooks/*; do
        if [ -x "$hook" ]; then
            echo "    - $(basename "$hook")"
        fi
    done
else
    echo -e "${YELLOW}WARN${NC}: 非 Git 仓库，跳过 hooks 配置。请先运行 git init。"
fi

# ------ 4. 安装依赖 ------
echo "--- [4/4] 安装依赖 ---"
echo "  执行 pnpm install ..."
pnpm install
if [ $? -ne 0 ]; then
    echo -e "${RED}FAIL${NC}: 依赖安装失败，请检查错误信息。"
    exit 1
fi
echo -e "${GREEN}PASS${NC}: 依赖安装成功"

echo ""
echo "============================================"
echo -e "  ${GREEN}环境搭建完成！${NC}"
echo "============================================"
echo ""
echo "  常用命令:"
echo "    pnpm dev                         # 启动开发服务器"
echo "    ./scripts/quick-check.sh         # 快速检查（tsc + biome + vitest）"
echo "    ./scripts/entropy-check.sh       # 熵检查（13 项）"
echo "    pnpm vitest run                  # 运行单元/组件测试"
echo "    pnpm playwright test             # 运行 E2E 测试"
echo ""
