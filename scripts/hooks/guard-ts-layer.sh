#!/bin/bash
# =================================================================
# guard-ts-layer.sh — PreToolUse Hook: FSD 分层架构守护（TypeScript/React）
# Feature-Sliced Design 层级（自上而下，下层不得 import 上层）：
#   app/ → widgets/ → features/ → entities/ ← shared/
# 违规时 exit 2 阻断写入，stderr 输出违规详情
# =================================================================

set -euo pipefail

INPUT=$(cat)

# 使用 python3 解析 JSON（避免 jq 依赖）
eval "$(echo "$INPUT" | python3 -c "
import sys, json, base64
try:
    data = json.load(sys.stdin)
    tool = data.get('tool_name', '')
    ti = data.get('tool_input', {})
    fp = ti.get('file_path', '')
    if tool == 'Write':
        content = ti.get('content', '')
    elif tool == 'Edit':
        content = ti.get('new_string', '')
    else:
        content = ''
    fp = fp.replace(\"'\", \"'\\\"'\\\"'\")
    b64 = base64.b64encode(content.encode()).decode()
    print(f\"TOOL_NAME='{tool}'\")
    print(f\"FILE_PATH='{fp}'\")
    print(f\"CONTENT_B64='{b64}'\")
except:
    print(\"TOOL_NAME=''\")
    print(\"FILE_PATH=''\")
    print(\"CONTENT_B64=''\")
" 2>/dev/null)"

if [ -z "$TOOL_NAME" ] || { [ "$TOOL_NAME" != "Write" ] && [ "$TOOL_NAME" != "Edit" ]; }; then
    exit 0
fi

CONTENT=$(echo "$CONTENT_B64" | base64 -d 2>/dev/null || echo "")

# 仅对 src/ 下 TS/TSX 源文件生效
case "$FILE_PATH" in
    */src/*.ts|*/src/*.tsx) ;;
    *) exit 0 ;;
esac

# 测试文件放行（测试可以引任何层作为被测对象）
case "$FILE_PATH" in
    *.test.ts|*.test.tsx|*.spec.ts|*.spec.tsx|*/tests/*) exit 0 ;;
esac

VIOLATIONS=""

# ------ 规则 1: entities/ 纯净性（禁 React/Next/状态库/fetch） ------
if [[ "$FILE_PATH" == */src/entities/* ]]; then
    if echo "$CONTENT" | grep -qE "from\s+['\"](react|next|next/.*|zustand|@tanstack/react-query)['\"]"; then
        VIOLATIONS="${VIOLATIONS}\n[BLOCKED] entities/ 禁止依赖 React/Next/Zustand/TanStack Query（entities 必须是纯 TS 业务模型）"
    fi
    if echo "$CONTENT" | grep -qE "\bfetch\s*\(|\baxios\b"; then
        VIOLATIONS="${VIOLATIONS}\n[BLOCKED] entities/ 禁止发起 HTTP 调用（IO 归 shared/api/）"
    fi
fi

# ------ 规则 2: FSD 依赖方向（下层不得 import 上层） ------
# entities 不得 import features / widgets / app
if [[ "$FILE_PATH" == */src/entities/* ]]; then
    if echo "$CONTENT" | grep -qE "from\s+['\"]@/(features|widgets|app)/"; then
        VIOLATIONS="${VIOLATIONS}\n[BLOCKED] entities/ 禁止导入上层（features/widgets/app），违反 FSD 依赖方向"
    fi
fi
# features 不得 import widgets / app
if [[ "$FILE_PATH" == */src/features/* ]]; then
    if echo "$CONTENT" | grep -qE "from\s+['\"]@/(widgets|app)/"; then
        VIOLATIONS="${VIOLATIONS}\n[BLOCKED] features/ 禁止导入 widgets/ 或 app/"
    fi
fi
# widgets 不得 import app
if [[ "$FILE_PATH" == */src/widgets/* ]]; then
    if echo "$CONTENT" | grep -qE "from\s+['\"]@/app/"; then
        VIOLATIONS="${VIOLATIONS}\n[BLOCKED] widgets/ 禁止导入 app/"
    fi
fi
# shared 不得 import 任何上层
if [[ "$FILE_PATH" == */src/shared/* ]]; then
    if echo "$CONTENT" | grep -qE "from\s+['\"]@/(entities|features|widgets|app)/"; then
        VIOLATIONS="${VIOLATIONS}\n[BLOCKED] shared/ 禁止导入上层（shared 是最基础层，不依赖任何业务层）"
    fi
fi

# ------ 规则 3: 跨 slice 禁止（同层 slice 之间禁止直接 import） ------
# 从路径解析当前 slice；例如 src/features/auth-login/model/x.ts → slice=auth-login
for layer in features entities widgets; do
    if [[ "$FILE_PATH" == */src/${layer}/* ]]; then
        # 取当前 slice 名（layer 后第一个目录）
        current_slice=$(echo "$FILE_PATH" | sed -E "s|.*/src/${layer}/([^/]+)/.*|\\1|")
        # 检查是否 import 了同层不同 slice（|| true 防止 grep 无匹配时 pipefail 杀脚本）
        other_slices=$(echo "$CONTENT" | grep -oE "from[[:space:]]+['\"]@/${layer}/[^/'\"]+" 2>/dev/null | sed -E "s|from[[:space:]]+['\"]@/${layer}/||" | sort -u || true)
        while IFS= read -r s; do
            [ -z "$s" ] && continue
            if [ "$s" != "$current_slice" ]; then
                VIOLATIONS="${VIOLATIONS}\n[BLOCKED] ${layer}/${current_slice} 禁止直接导入同层 slice ${layer}/${s}（跨 slice 复用请走 entities/ 或 shared/）"
            fi
        done <<< "$other_slices"
    fi
done

# ------ 规则 4: TS 严格性 ------
# 禁止无说明的 @ts-ignore（@ts-expect-error + 说明允许）
if echo "$CONTENT" | grep -qE '^\s*//\s*@ts-ignore\s*$'; then
    VIOLATIONS="${VIOLATIONS}\n[BLOCKED] 禁止裸 @ts-ignore；请改为 @ts-expect-error 并附原因"
fi

# ------ 输出结果 ------
if [ -n "$VIOLATIONS" ]; then
    echo -e "FSD 架构守护拦截 -- 文件: $FILE_PATH$VIOLATIONS" >&2
    echo -e "\n请修正后重试。参考: docs/standards/ts-dev.md" >&2
    exit 2
fi

exit 0
