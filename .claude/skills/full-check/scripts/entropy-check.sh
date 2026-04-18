#!/bin/bash
# =================================================================
# 熵检查脚本（TypeScript / FSD 版本）
# 13 项 grep 规则，交付前/CI 运行，防止架构漂移
# 用法: ./scripts/entropy-check.sh
# =================================================================

set -e
# 解析项目根（无论通过符号链接还是直接调用均正确）
PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ISSUES=0
WARNINGS=0

echo "============================================"
echo "  claude-j-web 熵检查 (Entropy Check)"
echo "============================================"
echo ""

# 若 src/ 尚未创建，跳过所有源码相关检查（允许空骨架跑绿）
has_src=false
if [ -d src ] && [ -n "$(find src -type f \( -name '*.ts' -o -name '*.tsx' \) 2>/dev/null | head -1)" ]; then
    has_src=true
fi

# ------ 1. entities 纯净性（禁 React / 状态库） ------
echo "--- [1/13] entities 纯净性 ---"
if $has_src && [ -d src/entities ]; then
    BAD=$(grep -rE "from\s+['\"](react|next|next/.*|zustand|@tanstack/react-query)['\"]" \
          --include='*.ts' --include='*.tsx' \
          --exclude='*.test.*' --exclude='*.spec.*' \
          src/entities/ 2>/dev/null | wc -l | tr -d ' ')
    if [ "$BAD" -gt 0 ]; then
        echo -e "${RED}FAIL${NC}: entities/ 下发现 $BAD 处 React/Next/Zustand/TanStack Query 依赖"
        ISSUES=$((ISSUES + 1))
    else
        echo -e "${GREEN}PASS${NC}: entities/ 层无框架依赖"
    fi
else
    echo -e "${GREEN}PASS${NC}: entities/ 不存在或为空（跳过）"
fi

# ------ 2. entities 禁止 IO ------
echo "--- [2/13] entities 禁止发起 HTTP ---"
if $has_src && [ -d src/entities ]; then
    BAD=$(grep -rE "\bfetch\s*\(|\baxios\b" --include='*.ts' --include='*.tsx' \
          --exclude='*.test.*' --exclude='*.spec.*' \
          src/entities/ 2>/dev/null | wc -l | tr -d ' ')
    if [ "$BAD" -gt 0 ]; then
        echo -e "${RED}FAIL${NC}: entities/ 发现 $BAD 处 HTTP 调用（应归 shared/api/）"
        ISSUES=$((ISSUES + 1))
    else
        echo -e "${GREEN}PASS${NC}: entities/ 零 HTTP 调用"
    fi
else
    echo -e "${GREEN}PASS${NC}: entities/ 不存在（跳过）"
fi

# ------ 3. FSD 依赖方向（下层不得 import 上层） ------
echo "--- [3/13] FSD 依赖方向 ---"
ARROW_VIOLATIONS=0
for rule in \
    "src/entities:@/(features|widgets|app)/" \
    "src/features:@/(widgets|app)/" \
    "src/widgets:@/app/" \
    "src/shared:@/(entities|features|widgets|app)/"; do
    dir="${rule%%:*}"
    pat="${rule##*:}"
    if [ -d "$dir" ]; then
        bad=$(grep -rE "from\s+['\"]${pat}" --include='*.ts' --include='*.tsx' \
              "$dir" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$bad" -gt 0 ]; then
            echo -e "${RED}FAIL${NC}: $dir 违反 FSD 依赖方向（禁 import $pat）: $bad 处"
            ARROW_VIOLATIONS=$((ARROW_VIOLATIONS + bad))
        fi
    fi
done
if [ "$ARROW_VIOLATIONS" -eq 0 ]; then
    echo -e "${GREEN}PASS${NC}: FSD 依赖方向全部正确"
else
    ISSUES=$((ISSUES + 1))
fi

# ------ 4. 跨 slice 禁止直接 import ------
echo "--- [4/13] 跨 slice 禁止直接 import ---"
CROSS_SLICE=0
for layer in features entities widgets; do
    [ -d "src/$layer" ] || continue
    while IFS= read -r f; do
        [ -z "$f" ] && continue
        current_slice=$(echo "$f" | sed -E "s|src/${layer}/([^/]+)/.*|\\1|")
        others=$(grep -oE "from\s+['\"]@/${layer}/[^/'\"]+" "$f" 2>/dev/null \
                 | sed -E "s|from\s+['\"]@/${layer}/||" | sort -u | grep -v "^${current_slice}$" || true)
        if [ -n "$others" ]; then
            echo -e "${RED}FAIL${NC}: $f 跨 slice import: $(echo $others | tr '\n' ' ')"
            CROSS_SLICE=$((CROSS_SLICE + 1))
        fi
    done < <(find "src/$layer" -type f \( -name '*.ts' -o -name '*.tsx' \) ! -name '*.test.*' ! -name '*.spec.*' 2>/dev/null)
done
if [ "$CROSS_SLICE" -eq 0 ]; then
    echo -e "${GREEN}PASS${NC}: 无跨 slice 直接 import"
else
    ISSUES=$((ISSUES + 1))
fi

# ------ 5. TS 严格性（禁裸 @ts-ignore） ------
echo "--- [5/13] 禁裸 @ts-ignore ---"
if $has_src; then
    BAD=$(grep -rE '^\s*//\s*@ts-ignore\s*$' --include='*.ts' --include='*.tsx' src/ 2>/dev/null | wc -l | tr -d ' ')
    if [ "$BAD" -gt 0 ]; then
        echo -e "${RED}FAIL${NC}: 发现 $BAD 处裸 @ts-ignore（用 @ts-expect-error + 原因）"
        ISSUES=$((ISSUES + 1))
    else
        echo -e "${GREEN}PASS${NC}: 无裸 @ts-ignore"
    fi
else
    echo -e "${GREEN}PASS${NC}: src 空（跳过）"
fi

# ------ 6. any 类型使用（WARN） ------
echo "--- [6/13] any 类型使用 ---"
if $has_src; then
    BAD=$(grep -rE '\bany\b' --include='*.ts' --include='*.tsx' \
          --exclude='*.test.*' --exclude='*.spec.*' \
          src/ 2>/dev/null | grep -vE '^\s*\*|//' | wc -l | tr -d ' ')
    if [ "$BAD" -gt 5 ]; then
        echo -e "${YELLOW}WARN${NC}: 发现 $BAD 处可能的 any 用法（考虑替换为 unknown / 明确类型）"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}PASS${NC}: any 用法在可接受范围内（${BAD}）"
    fi
else
    echo -e "${GREEN}PASS${NC}: src 空（跳过）"
fi

# ------ 7. fetch 外溢（shared/api 之外出现 fetch） ------
echo "--- [7/13] fetch/axios 归口 shared/api ---"
if $has_src; then
    BAD=$(grep -rE "\bfetch\s*\(|\baxios\b" --include='*.ts' --include='*.tsx' \
          --exclude='*.test.*' --exclude='*.spec.*' \
          src 2>/dev/null | grep -vE 'src/+shared/api/' | wc -l | tr -d ' ')
    if [ "$BAD" -gt 0 ]; then
        echo -e "${RED}FAIL${NC}: shared/api/ 之外发现 $BAD 处 fetch/axios 调用"
        ISSUES=$((ISSUES + 1))
    else
        echo -e "${GREEN}PASS${NC}: HTTP 调用已归口 shared/api/"
    fi
else
    echo -e "${GREEN}PASS${NC}: src 空（跳过）"
fi

# ------ 8. 默认导出（entities/features 禁 default export） ------
echo "--- [8/13] entities/features 禁默认导出 ---"
DEF_EXP=0
for dir in src/entities src/features; do
    [ -d "$dir" ] || continue
    bad=$(grep -rE "^export\s+default" --include='*.ts' --include='*.tsx' "$dir" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$bad" -gt 0 ]; then
        echo -e "${RED}FAIL${NC}: $dir 发现 $bad 处 default export（强制命名导出便于 rename 追踪）"
        DEF_EXP=$((DEF_EXP + bad))
    fi
done
if [ "$DEF_EXP" -eq 0 ]; then
    echo -e "${GREEN}PASS${NC}: entities/features 全部命名导出"
else
    ISSUES=$((ISSUES + 1))
fi

# ------ 9. 测试命名 should_xxx_when_yyy ------
echo "--- [9/13] 测试方法命名 ---"
TEST_FILES=$(find src tests -type f \( -name '*.test.ts' -o -name '*.test.tsx' -o -name '*.spec.ts' -o -name '*.spec.tsx' \) 2>/dev/null)
BAD_NAMES=0
if [ -n "$TEST_FILES" ]; then
    for f in $TEST_FILES; do
        # 捕获 it('...') / test('...') 的第一个参数，若不是 should_xxx_when_yyy 则记
        bad=$(grep -oE "(it|test)\(\s*['\"][^'\"]+" "$f" 2>/dev/null \
              | sed -E "s/.*['\"]//" \
              | grep -vE '^should_[a-z0-9_]+_when_[a-z0-9_]+$' | wc -l | tr -d ' ')
        BAD_NAMES=$((BAD_NAMES + bad))
    done
fi
if [ "$BAD_NAMES" -gt 0 ]; then
    echo -e "${YELLOW}WARN${NC}: $BAD_NAMES 个测试名不符合 should_xxx_when_yyy（由 Biome 规则或后续补齐）"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}PASS${NC}: 测试命名规范"
fi

# ------ 10. 聚合根/实体禁用 public setter ------
echo "--- [10/13] entities 禁 public setter ---"
if [ -d src/entities ]; then
    BAD=$(grep -rE "^\s*set\s+[a-zA-Z_]+\s*\(" --include='*.ts' src/entities/ 2>/dev/null | wc -l | tr -d ' ')
    if [ "$BAD" -gt 0 ]; then
        echo -e "${YELLOW}WARN${NC}: entities/ 发现 $BAD 处 setter（聚合应通过命名方法变更状态）"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}PASS${NC}: entities/ 无 setter"
    fi
else
    echo -e "${GREEN}PASS${NC}: entities/ 不存在（跳过）"
fi

# ------ 11. 文件长度 ------
echo "--- [11/13] 文件长度 ---"
if $has_src; then
    LONG=$(find src -type f \( -name '*.ts' -o -name '*.tsx' \) -exec awk 'END{if(NR>300)print FILENAME":"NR}' {} \; 2>/dev/null | wc -l | tr -d ' ')
    if [ "$LONG" -gt 0 ]; then
        echo -e "${YELLOW}WARN${NC}: $LONG 个文件超过 300 行"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}PASS${NC}: 无超长文件"
    fi
else
    echo -e "${GREEN}PASS${NC}: src 空（跳过）"
fi

# ------ 12. README / CLAUDE.md 一致性 ------
echo "--- [12/13] 入口文档存在 ---"
if [ -f CLAUDE.md ] && [ -f PORTING.md ]; then
    echo -e "${GREEN}PASS${NC}: CLAUDE.md + PORTING.md 存在"
else
    echo -e "${RED}FAIL${NC}: 缺失 CLAUDE.md 或 PORTING.md"
    ISSUES=$((ISSUES + 1))
fi

# ------ 13. 归档后篡改检测（从 claude-j 继承） ------
echo "--- [13/13] 归档后篡改检测 ---"
if [ -d .git ]; then
    SUSPECT=$(git log --since="30.days" --no-renames --diff-filter=M \
        --pretty=format:"%h %s" -- docs/exec-plan/archived/ 2>/dev/null \
        | grep -iEv "archive" || true)
    if [ -n "$SUSPECT" ]; then
        echo -e "${YELLOW}WARN${NC}: 归档后被修改（30 天内）"
        echo "$SUSPECT"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}PASS${NC}: 归档区干净"
    fi
else
    echo -e "${GREEN}PASS${NC}: 无 git 仓库（跳过）"
fi

# ------ 汇总 ------
echo ""
echo "============================================"
echo "  熵检查结果"
echo "============================================"
if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ 全部 13 项通过${NC}"
    exit 0
elif [ $ISSUES -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS 项警告，建议清理${NC}"
    exit 0
else
    echo -e "${RED}❌ $ISSUES 项 FAIL / $WARNINGS 项 WARN${NC}"
    exit 1
fi
