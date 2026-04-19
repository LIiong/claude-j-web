---
name: dev-spec
description: "@dev Spec 阶段：需求拆解、FSD 建模、API 契约、UI 原型（若 ui-surface=true）。创建任务目录和设计文档，提交 @architect 评审。"
user-invocable: true
disable-model-invocation: true
argument-hint: "[task-id]-[task-name]"
allowed-tools: "Read Write Edit Glob Grep Bash(ls *) Bash(mkdir *) Bash(cp *) Bash(git *) Bash(echo *) Bash(date *)"
---

# @dev Spec 阶段 — 需求拆解与 FSD 设计

你是 claude-j-web 的高级前端工程师，正在执行 Spec 阶段。本阶段仅做**设计**，禁止编写业务代码。

## 输入
- 任务标识：`$ARGUMENTS`（格式 `{task-id}-{task-name}`，如 `007-shopping-cart`）
- 用户提供的需求描述（由上游 prompt 传入）

## 参考文档（执行前必须阅读）
- `CLAUDE.md` — 项目概述、聚合（slice）列表、架构规则
- `docs/architecture/overview.md` — FSD 架构详解
- `docs/architecture/decisions/` — 已有 ADR（避免冲突）
- `.claude/rules/ts-dev.md` / `.claude/rules/ts-test.md` — 开发 + 测试规范
- `.claude/rules/architecture.md` — FSD 依赖方向
- `docs/exec-plan/templates/` — 文档模板
- `src/shared/api/generated/` — 后端 OpenAPI 生成产物（只读）
- 已有 slice 代码（`src/entities/` / `src/features/` 下任一 slice，了解模式）

## 执行步骤

### 0. 注册角色标记
```bash
echo "dev" > .claude-current-role
```

### 1. 创建任务目录 + 复制模板
```bash
mkdir -p docs/exec-plan/active/$ARGUMENTS/
cp docs/exec-plan/templates/requirement-design.template.md docs/exec-plan/active/$ARGUMENTS/requirement-design.md
cp docs/exec-plan/templates/task-plan.template.md          docs/exec-plan/active/$ARGUMENTS/task-plan.md
cp docs/exec-plan/templates/dev-log.template.md            docs/exec-plan/active/$ARGUMENTS/dev-log.md
```

### 2. 需求分析
- 识别核心业务能力与边界
- 对照 CLAUDE.md 聚合列表：新增 slice or 扩展已有 slice？
- 检查 `src/shared/api/generated/`：相关后端端点是否已存在？
- 识别影响范围：涉及哪些层（entities/features/widgets/app）与 slice

### 3. FSD 建模
| 元素 | 归属层 | 约束 |
|------|-------|------|
| **Entity / 聚合** | `entities/<slice>/` | 封装业务不变量，状态变更仅通过命名方法，`readonly` 字段；禁 react/next/zustand/@tanstack |
| **值对象** | `entities/<slice>/` | 不可变，`readonly` 字段 + 工厂方法，构造时校验 |
| **DTO + Zod schema** | `shared/api/` | 与后端契约对齐，仅出现在 shared/api |
| **mapper (DTO↔Entity)** | `features/<slice>/api/` 或 `shared/api/` | 单向依赖，带单测 |
| **feature hook / store** | `features/<slice>/model/` | 用例编排与状态 |
| **UI 组件** | `features/<slice>/ui/` 或 `widgets/` | 接收 UI Model，不直接接收 Entity |

### 4. 填写 requirement-design.md
覆盖以下节点：
1. 需求描述（1–3 句话）
2. UI 原型（若 `ui-surface=true` — 调用 `gsd:ui-phase` 产出 UI-SPEC.md 并在此引用；否则写 `N/A (backend-only)`）
3. 领域分析（Entity / 值对象 / DTO / store / hook，每项列属性 + 约束）
4. 关键算法/技术方案
5. API 契约（对接的后端端点、请求/响应 Zod schema、错误处理策略）
6. 路由/页面设计（Next.js App Router 路径、server/client 边界）
7. 影响范围（按 entities / shared/api / features / widgets / app 分层列出）

### 5. 填写 task-plan.md
- 按分层拆解子任务：`entities → shared/api → features/model → features/api → features/ui → widgets → app`
- 每行任务含：层、负责人、状态（初始「待办」）、验证命令
- 确保开发顺序正确（上层依赖下层）

### 6. 初始化 dev-log.md
保留模板骨架，后续 Build 阶段填写。

### 7. 创建 handoff.md（提交架构评审）
```yaml
---
task-id: "$ARGUMENTS"
from: dev
to: architect
status: pending-review
task-type: frontend           # backend-only | frontend | full-stack
ui-surface: true              # 是否产出可见 UI；false 则跳过 UI 流程
timestamp: "{date -u +%Y-%m-%dT%H:%M:%SZ}"
pre-flight:
  tsc: pending
  vitest: pending
  biome: pending
  entropy-check: pending
artifacts:
  - requirement-design.md
  - task-plan.md
  # - UI-SPEC.md   (若 ui-surface=true)
summary: "{一句话概述需求范围与 slice 设计}"
---
```

### 8. git 提交产出物
```bash
git add docs/exec-plan/active/$ARGUMENTS/
git commit -m "docs(spec): $ARGUMENTS 需求设计与任务计划"
```

## 产出物清单
`docs/exec-plan/active/$ARGUMENTS/` 必须包含：
- `requirement-design.md` — 需求设计（领域分析、API 契约、UI 章节）
- `task-plan.md` — 任务执行计划
- `dev-log.md` — 开发日志（初始骨架）
- `handoff.md` — 交接文件（`to: architect, status: pending-review`）
- `UI-SPEC.md` — UI 设计契约（仅 ui-surface=true）

## 架构约束提醒
- FSD 依赖方向：`app → widgets → features → entities ← shared`
- entities 层纯 TS，禁止 react/next/zustand/@tanstack/* import
- 值对象不可变，Entity 禁止 public setter
- 对象转换链：API Response ↔ DTO (Zod) ↔ Entity ↔ UI Model
- TS strict + noUncheckedIndexedAccess（禁裸 @ts-ignore、禁生产 any）
- 命名导出优先（entities/features/widgets 禁 export default）
- `fetch`/`axios` 只允许出现在 `shared/api/`

## 完成后行为

**独立使用模式**（用户直接运行 `/dev-spec`）：
输出摘要后告知用户运行 `/architect-review $ARGUMENTS` 进行设计评审。

**Ralph 编排模式**（由 Ralph 主 Agent 通过 Agent 工具调度）：
仅输出简要摘要（slice 设计、任务数、关键决策），由 Ralph 自动调度下一阶段。
