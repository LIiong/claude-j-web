# TypeScript 测试规则

## 适用范围
- **生效时机**：编辑 `*.test.ts(x)` / `*.spec.ts(x)` / `tests/` 下文件时自动注入。
- **目标**：保障分层测试策略一致、行为可验证、测试可维护。

## MUST（强制）

### 测试分层
| 层 | 框架 | 框架依赖 | 关注点 |
|---|---|---|---|
| entities | Vitest 纯 | 禁 React / MSW / fetch | 不变量、状态转换、值对象相等 |
| features | Vitest + MSW | 允许 MSW 拦截 HTTP | 用例编排、happy/异常分支 |
| widgets / pages | RTL + Vitest + jsdom | 允许 React 渲染 | 用户视角行为（role/label/text） |
| E2E | Playwright | 完整浏览器 | 核心业务流程（登录→核心操作） |

### 命名与结构
- 测试文件与被测文件同目录，后缀 `.test.ts(x)`（就近维护）。
- `it(...)` / `test(...)` 的第一个参数必须采用 `should_{预期}_when_{条件}` 格式。
- 测试结构使用 AAA（Arrange / Act / Assert），每段之间空行分隔。

### 断言
- Widget 测试用 `@testing-library/react` 的 `getByRole` / `getByLabelText` 等**用户视角查询**；禁止 `querySelector('.classname')` 断实现细节。
- Feature 测试断言**副作用**（MSW 观察到的请求、store 的最终状态）。
- Entity 测试断言**不变量**（非法转换应抛错）。

### 集成测试适量
- Playwright E2E 单任务新增 ≤ 3 个（Happy path + 关键分支 1–2）。
- **禁止**在新任务的 E2E 里重复覆盖其他 slice 的功能（回归职责归 `pnpm test` + dependency-cruiser）。

## TDD 铁律
```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

任何 `src/` 下的业务代码必须先有一个**看到过红**的测试。

### Red-Green-Refactor
1. **Red** — 先写失败测试，`pnpm vitest run <path>` 确认真失败（非编译错误）。
2. **Green** — 写最小实现让测试通过。
3. **Refactor** — 测试保持绿的前提下清理。

## TDD 反模式对照表

| 借口 | 真相 | 在 claude-j-web 中的本土化 |
|---|---|---|
| "我先写组件再补测试" | = 删除重来 | 组件/feature hook 先 RTL 测试 |
| "我手工点过了" | 手工 ≠ 回归 | 必须 `should_xxx_when_yyy` 测试 |
| "TS 类型保证了，不用测" | 类型不等于行为 | 行为有分支就必测 |
| "storybook 里有用例了" | story ≠ 断言 | story 不跑断言，必须单测 |
| "E2E 覆盖了" | E2E 慢且脆弱 | entity/feature 层必须独立单测 |
| "代码简单" | 简单代码也有不变量 | 值对象也测 |

## MUST NOT（禁止）
- 禁止在 `entities/` 测试中 import React / MSW。
- 禁止 `Thread.sleep`（用 `vi.useFakeTimers` / `await waitFor`）。
- 禁止直接测私有字段（访问不到就是设计问题）。
- 禁止单任务新增超过 3 个 Playwright E2E。
- 禁止在新任务 E2E 里重复覆盖其他 slice。

## 执行检查
1. 新增功能同步补齐对应层测试。
2. `pnpm vitest run` + `pnpm exec depcruise src` 全过。
3. UI 改动额外跑 `pnpm playwright test`（若已配置）。
