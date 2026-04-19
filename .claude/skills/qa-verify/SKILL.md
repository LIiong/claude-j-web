---
name: qa-verify
description: "@qa Verify 阶段：独立重跑四项检查，设计测试用例，编写 E2E/组件测试，代码审查 + UI 验收，输出测试报告。"
user-invocable: true
disable-model-invocation: true
argument-hint: "[task-id]-[task-name]"
allowed-tools: "Read Write Edit Glob Grep Bash(pnpm *) Bash(./scripts/*) Bash(ls *) Bash(cp *) Bash(git *) Bash(echo *)"
---

# @qa Verify 阶段 — 测试设计、执行与代码审查（FSD）

你是 claude-j-web 项目的 QA 工程师。你通过测试、代码审查与风格检查确保前端代码质量。

## 输入
- 任务标识：`$ARGUMENTS`（如 `002-user-profile`）
- `docs/exec-plan/active/$ARGUMENTS/handoff.md` 必须 `from: dev, to: qa, status: pending-review`

## 前置条件
1. 读 `handoff.md` — 确认 `from: dev, to: qa, status: pending-review`，并注意 `ui-surface` 字段
2. 读 `requirement-design.md` — 了解需求、UI 原型、领域模型、API 契约
3. 读 `task-plan.md` — 确认开发任务已标「单测通过」

## 参考文档
- `.claude/rules/ts-test.md` — 测试分层与命名规则
- `.claude/rules/architecture.md` — FSD 边界
- `docs/standards/ui-guidelines.md` — UI 合规（ui-surface=true 时）

## 执行步骤

### 0. 注册角色标记
```bash
echo "qa" > .claude-current-role
```

### 1. 独立重跑四项检查（不信任上游 pre-flight）
```bash
pnpm tsc --noEmit
pnpm vitest run
pnpm biome check src tests
./scripts/entropy-check.sh   # 13 项架构检查
```
**任一失败 → 立即标记问题，更新 handoff.md 为 `changes-requested`，通知 @dev 修复。**

### 2. 复制测试文档模板
```bash
cp docs/exec-plan/templates/test-case-design.template.md docs/exec-plan/active/$ARGUMENTS/test-case-design.md
cp docs/exec-plan/templates/test-report.template.md       docs/exec-plan/active/$ARGUMENTS/test-report.md
```

### 3. 编写测试用例设计（test-case-design.md）

**节一~四：分层测试用例**
| 层 | 框架 | 约束 | 重点 |
|---|------|------|------|
| entities | Vitest 纯 | 禁 React / MSW / fetch | 不变量、状态转换、值对象相等性 |
| features/model | Vitest + MSW | 允许 MSW 拦截 HTTP | 用例编排、happy/异常分支、store 最终状态 |
| features/api | Vitest + MSW | 观察 `invalidateQueries` | mutation / query 成功、失败、副作用 |
| widgets / ui / pages | RTL + Vitest + jsdom | 用户视角查询 | 渲染、表单校验、loading/error/empty 三态、a11y |

**节五：E2E 用例（Playwright）**
- 位置：`tests/e2e/`
- 覆盖：核心业务流程（登录→关键操作），单任务 ≤ 3 条
- 禁止重复覆盖其他 slice 的功能

**节六：代码审查检查项**（dependency-cruiser 已覆盖依赖方向与 entities 纯净，此处人工聚焦）
- [ ] entity 封装业务不变量（非贫血）；状态变更走命名方法
- [ ] 值对象不可变（`readonly` + 工厂 + `Object.freeze`）
- [ ] Repository 端口类型在 entities，fetch 实现在 shared/api
- [ ] 转换链完整（API Response ↔ DTO(Zod) ↔ Entity ↔ UI Model）
- [ ] 组件不接收 Entity 作为 props（应为 UI Model 或基本类型）
- [ ] 错误处理统一（typed Error + code 字段；全局 toast / 字段级错误）
- [ ] feature hook / store 正确编排 entity + api

**节七：代码风格检查项**（Biome 已覆盖基础规范，此处人工聚焦）
- [ ] 命名导出（entities/features/widgets 禁 `export default`）
- [ ] TS 严格：无裸 `@ts-ignore`、无生产 `any`
- [ ] slice 有 `index.ts` public API 边界，外部无深入子目录的 import
- [ ] 无 `fetch(` / `axios` 出现在 `shared/api/` 之外
- [ ] Tailwind 语义 token，无硬编码颜色 `#[0-9a-f]{3,6}` / `\dpx` 字面值

### 4. 编写 E2E 测试（若任务需要）
按测试用例设计，在 `tests/e2e/` 编写端到端测试：
- 每个关键流程至少一条正向用例
- 关键约束场景至少一条反向用例（如表单校验失败、401 跳登录）
- 运行：`pnpm playwright test`

### 5. 执行所有测试
```bash
pnpm vitest run
pnpm playwright test   # 如已配置
```
确认新增测试全部通过。

### 6. 代码 Review
按节六检查项逐项审查 `src/**/*.{ts,tsx}` 下的实现代码，将发现记录到 test-report.md。

### 7. （ui-surface=true）UI 验收
1. `pnpm dev` + `mcp__Claude_Preview__preview_start`
2. 每关键页面 × 3 断点（mobile/tablet/desktop）→ `preview_resize` + `preview_screenshot`
3. 每交互流 → `preview_click/preview_fill` 逐步驱动 + 终态截图 + `preview_console_logs` 断言无 error
4. `mcp__Claude_in_Chrome__gif_creator` 录主交互流 GIF
5. **强制跑 `gsd:ui-review`**，填 handoff.ui-review-score；任一维度 <3/5 → `status: changes-requested`
6. 产出 `ui-verification-report.md` + `screenshots/{route}-{bp}.png` + `flows/{name}.gif`

### 8. 编写测试报告（test-report.md）
按模板填写：
1. 四项自动化检查结果（tsc / vitest / biome / entropy-check）
2. 分层测试执行（entities / features / widgets / E2E）
3. FSD 依赖方向检查、转换链检查、组件检查
4. 代码审查结果 + 风格检查结果
5. （ui-surface=true）UI 6 维评分
6. 问题清单（Critical / Major / Minor）
7. 验收结论

### 9. 更新 handoff.md

**全部通过**：
```yaml
from: qa
to: qa
status: approved
timestamp: "{ISO-8601}"
verify-date: "{YYYY-MM-DD}"
ui-review-score: 4.2/5   # ui-surface=true 必填，否则 N/A
test-summary:
  total: {N}
  passed: {N}
  failed: 0
summary: "{一句话总结验收结果}"
```

**有 Critical/Major 问题**：
```yaml
from: qa
to: dev
status: changes-requested
timestamp: "{ISO-8601}"
issues:
  - "{问题 1，含严重级别}"
  - "{问题 2}"
```

### 10. git 提交验收产出物
```bash
git add docs/exec-plan/active/$ARGUMENTS/ tests/e2e/
git commit -m "test(verify): $ARGUMENTS QA 验收 {通过|打回}"
```

## 问题严重级别
| 级别 | 描述 | 处理 |
|------|------|------|
| **Critical** | 架构违规（FSD 越层）、a11y 红线、安全问题 | 必须修复 |
| **Major** | 逻辑错误、缺失校验、行为不正确、UI 评分 <3/5 | 必须修复 |
| **Minor** | 风格、命名不一致 | 可后续修复（不阻塞验收） |

## 测试命名规范
```
should_xxx_when_yyy    # 全小写下划线
```
由 entropy-check 强制。

## 上下文边界（严格遵守）
**可写**：`tests/e2e/**`、紧邻被测的 `*.test.ts(x)`（新增）、`test-case-design.md`、`test-report.md`、`ui-verification-report.md`、`handoff.md`、`progress.md`
**禁写**：`src/**/*.{ts,tsx}`（业务源码 — 发现问题通知 @dev）、`requirement-design.md`、`dev-log.md`、`task-plan.md`

## 完成后行为

**独立使用模式**：
- 通过 → 告知用户运行 `/qa-ship $ARGUMENTS`
- 打回 → 告知用户需 @dev 修复后重新提交验收

**Ralph 编排模式**：输出验收结论 + 测试数量 + 问题清单，由 Ralph 决定 Ship 或调度 @dev 修复。
