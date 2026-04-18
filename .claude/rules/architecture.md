---
description: "FSD 架构约束：依赖方向、对象边界、聚合设计。操作 TS/TSX、架构测试配置时强制生效。"
globs:
  - "**/*.ts"
  - "**/*.tsx"
  - ".dependency-cruiser.cjs"
  - "next.config.*"
  - "tsconfig*.json"
alwaysApply: false
---

# 架构约束规则（FSD）

## 适用范围
- **生效时机**：编辑 TS/TSX、`.dependency-cruiser.cjs`、`next.config.*` 时自动注入。
- **目标**：确保 Feature-Sliced Design 边界长期稳定，避免架构漂移。

## MUST（强制）

### 依赖方向
- 只允许：`app → widgets → features → entities`；`shared` 为公共基础层，可被以上任何层依赖，但自身不得反向依赖。
- `app/`（Next.js App Router）仅做装配（路由、Provider、layout），不承载业务规则。
- 新增 slice 时先声明其所属层，再决定可 import 的内容。

### 对象边界
- 转换链完整：`API Response ↔ DTO（Zod schema @ shared/api）↔ Entity（@ entities）↔ UI Model（@ widgets/features）`。
- DTO 只存在于 `shared/api/`，不得泄漏到 entities 之外。
- Entity 不得直接作为 `<Component>` 的 props（组件应接收 UI Model 或基本类型）。

### 聚合与状态
- Entity 封装所有业务不变量，状态变更仅通过命名方法（禁 public setter）。
- 跨 slice 协作优先走事件 / URL / store，不得 slice 间直接 import。
- 一个 mutation 只修改一个 slice 的 store（复杂流程用 TanStack Query `invalidateQueries` 串联）。

## MUST NOT（禁止）
- 禁止 `entities/` 出现 `react` / `next/*` / `zustand` / `@tanstack/*` import。
- 禁止 `shared/` 反向 import 任何业务层。
- 禁止 `features/a` import `features/b/*`（跨 slice）。
- 禁止 `useState` 在 `entities/` 或 `features/model/store` 以外出现业务状态。
- 禁止 `fetch(` / `axios` 出现在 `shared/api/` 之外。

## 执行检查
1. `pnpm exec depcruise src --config` 验证架构规则全过。
2. 检查 import 与 `@/<layer>/` 路径，确认未出现逆向依赖。
3. 运行 `./scripts/entropy-check.sh`（13 项）。
