# CLAUDE.md

## 项目概述
claude-j 企业级前端 —— Next.js 15 + TypeScript + Feature-Sliced Design。
对接 claude-j 后端（Java/Spring Boot），通过 OpenAPI 生成类型安全的 API 客户端。

**技术栈**：TypeScript 5.6 / Next.js 15（App Router + RSC）/ React 19 / Tailwind CSS 4 /
shadcn/ui / TanStack Query v5 / Zustand / React Hook Form + Zod /
Biome / Vitest + RTL / Playwright / dependency-cruiser / pnpm 9

## 快速开始
```bash
# 安装
pnpm install

# 开发
pnpm dev

# Skill 方式（在 Claude Code 会话内）
/ralph 001-feature-name 需求描述
```

## 构建命令
```bash
pnpm dev                       # 开发服务器（Next.js）
pnpm build                     # 生产构建
pnpm tsc --noEmit              # 类型检查
pnpm biome check src tests     # lint + format 检查
pnpm vitest run                # 单元 + 组件测试
pnpm exec depcruise src        # 架构规则检查
pnpm playwright test           # E2E（需先 build）
./scripts/quick-check.sh       # tsc + biome + vitest 快速检查
./scripts/entropy-check.sh     # 架构漂移检测（13 项）
```

## 架构（Feature-Sliced Design）
```
app → widgets → features → entities ← shared
```
- **app/**（Next.js App Router）：路由、Layout、全局 Provider；仅装配，不承载业务规则
- **widgets/**：页面级组合（header、sidebar、复杂 section）
- **features/**：单一用户场景（auth-login、user-profile-edit）；每个 slice 自闭
- **entities/**：纯 TS 业务模型 + 不变量（**禁** React/Next/Zustand/TanStack Query/fetch）
- **shared/**：`ui/`（shadcn/ui）、`api/`（OpenAPI 客户端、fetch 封装）、`lib/`、`config/`

## 当前聚合（slice）
<!-- 随业务开发逐步填入 -->
| 层 | Slice | 说明 |
|----|-------|------|
| — | — | 新项目，尚无业务 slice |

## 关键约定
- 路径别名：`@/*` → `src/*`
- 命名导出 > 默认导出（entities/features 强制命名导出）
- Entity 封装不变量，禁止 public setter；状态变更走命名方法
- 转换链：`API Response ↔ DTO (Zod schema) ↔ Entity ↔ UI Model`
- 重要决策记录 ADR（`docs/architecture/decisions/`）

## 三条心智铁律（Iron Laws）
```
1. TDD          —  NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
2. VERIFICATION —  NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
3. DEBUG        —  NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```
- TDD 细则：`.claude/rules/ts-test.md`
- 举证规则：`.claude/rules/verification-gate.md`
- 调试铁轨：`.claude/skills/systematic-debugging/SKILL.md`

## 四项心智原则
1. **想清楚再写**（显式声明假设 / 多方案取舍 / 不懂就停）
2. **简洁优先**（最少代码；禁过早抽象、禁投机功能）
3. **外科式变更**（只动该动的；不顺手优化相邻代码）
4. **目标驱动执行**（可验证目标，弱目标转强目标）

详见 `.claude/rules/karpathy-guidelines.md`。

## 自动化守护

| 守护 | 执行方式 | 触发时机 |
|------|---------|---------|
| FSD 依赖方向 + entities 纯净 + 跨 slice + TS 严格性 | `guard-ts-layer.sh` Hook | 每次 Edit/Write |
| 开发准入（需有执行计划 + 评审通过） | `guard-dev-gate.sh` Hook | 写 `src/**` 时 |
| Agent 写作域边界（dev/qa/architect 越权拦截） | `guard-agent-scope.sh` Hook | 每次 Edit/Write |
| 类型 + 单测 + lint（提交后阻断） | `post-commit-check.sh` Hook | git commit 后 |
| 架构规则（dependency-cruiser） | `pnpm exec depcruise` | CI / 本地 |
| 代码风格 + lint | Biome | `pnpm biome check` |
| 熵扫描（13 项） | `scripts/entropy-check.sh` | 交付前 / CI |
| 会话启动上下文注入 | `session-start.sh` Hook | 新会话开始 |

## Skill 命令

| 命令 | 说明 |
|------|------|
| `/ralph <task-id> <需求>` | **一键交付**：Spec→Review→Build→Verify→Ship |
| `/ralph <task-id>` | 续跑 |
| `/ralph <task-id> --loop` | Ralph Loop 多会话 |
| `/dev-spec [task-id]` | 单独 Spec |
| `/architect-review [task-id]` | 单独架构评审 |
| `/dev-build [task-id]` | 单独 TDD 开发 |
| `/qa-verify [task-id]` | 单独 QA 验收 |
| `/qa-ship [task-id]` | 归档已验收任务 |
| `/task-status [task-id]` | 任务状态一览 |
| `/full-check` | tsc + vitest + biome + entropy-check |

## Agent 团队

```
Ralph（编排主 Agent）
  ├── @dev       → Spec / Build
  ├── @architect → Review
  ├── @qa        → Verify
  └── 主 Agent   → Ship
```

- **@dev** — 编码（见 `.claude/agents/dev.md`；部分 Java 术语在首个任务时按 TS 对齐）
- **@qa** — 测试与审查（见 `.claude/agents/qa.md`）
- **@architect** — 设计评审（见 `.claude/agents/architect.md`）

## 参考文档
- 架构详解：`docs/architecture/overview.md`
- TS 开发规范：`.claude/rules/ts-dev.md`
- TS 测试规范：`.claude/rules/ts-test.md`
- 移植指南：`PORTING.md`

## 后端对接
- OpenAPI schema 来源：`http://localhost:8080/v3/api-docs`（claude-j 后端）
- 生成命令：`pnpm run generate:api`（见 `package.json` scripts）
- 生成产物：`src/shared/api/generated/`（禁止手改）
