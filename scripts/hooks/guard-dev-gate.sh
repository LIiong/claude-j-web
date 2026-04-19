#!/bin/bash
# =================================================================
# guard-dev-gate.sh — PreToolUse Hook: 开发准入守护
# 在写入业务源码（src/**/*.{ts,tsx}，不含测试与生成文件）前检查是否有已批准的执行计划
# 无活跃任务或任务状态不允许时 exit 2 阻断
# =================================================================

set -euo pipefail

INPUT=$(cat)

# 解析目标文件路径
FILE_PATH=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    ti = data.get('tool_input', {})
    print(ti.get('file_path', ''))
except:
    print('')
" 2>/dev/null)

# 仅对业务源码（src/**/*.ts, src/**/*.tsx）启用 Gate
# 放行：非 src/、测试文件（*.test.ts / *.spec.ts / tests/）、生成文件（shared/api/generated/）、类型声明（*.d.ts）
if [[ "$FILE_PATH" != */src/*.ts && "$FILE_PATH" != */src/*.tsx ]]; then
    exit 0
fi
if [[ "$FILE_PATH" == *.test.ts || "$FILE_PATH" == *.test.tsx || "$FILE_PATH" == *.spec.ts || "$FILE_PATH" == *.spec.tsx ]]; then
    exit 0
fi
if [[ "$FILE_PATH" == *"/tests/"* || "$FILE_PATH" == *"/shared/api/generated/"* || "$FILE_PATH" == *.d.ts ]]; then
    exit 0
fi

cd "$(dirname "$0")/../.."

PLAN_DIR="docs/exec-plan/active"

# 无活跃任务目录 → 阻断
if [ ! -d "$PLAN_DIR" ] || [ -z "$(ls -A "$PLAN_DIR" 2>/dev/null)" ]; then
    echo "❌ DEV GATE: 没有活跃的执行计划，禁止写入业务代码" >&2
    echo "   请先运行 /dev-spec [task-id] 创建执行计划" >&2
    exit 2
fi

# 遍历活跃任务，检查是否有允许编码的状态
ALLOWED=false
for task_dir in "$PLAN_DIR"/*/; do
    handoff="$task_dir/handoff.md"
    if [ ! -f "$handoff" ]; then
        # 无 handoff 文件，检查是否至少有 requirement-design.md
        if [ -f "$task_dir/requirement-design.md" ]; then
            ALLOWED=true
            break
        fi
        continue
    fi
    STATUS=$(grep "^status:" "$handoff" 2>/dev/null | head -1 | cut -d: -f2 | tr -d ' ')
    TO=$(grep "^to:" "$handoff" 2>/dev/null | head -1 | cut -d: -f2 | tr -d ' ')
    case "$STATUS" in
        approved|coding-in-progress|spec-complete)
            ALLOWED=true
            break
            ;;
        pending-review)
            # pending-review + to:architect = 等待评审，禁止编码
            # pending-review + to:qa = dev 已完成编码提交 QA，允许（可能需要修补）
            if [ "$TO" != "architect" ]; then
                ALLOWED=true
                break
            fi
            ;;
    esac
done

if [ "$ALLOWED" = false ]; then
    echo "❌ DEV GATE: 活跃任务状态不允许编码" >&2
    echo "   可能原因：等待架构评审(pending-review→architect)、设计被打回(changes-requested)" >&2
    echo "   请先通过评审或修正设计，或运行 /dev-spec 创建新任务" >&2
    exit 2
fi

exit 0
