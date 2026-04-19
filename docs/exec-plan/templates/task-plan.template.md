# 任务执行计划 — {task-id}-{task-name}

## 任务状态跟踪

<!-- 状态流转：待办 → 进行中 → 单测通过 → 待验收 → 验收通过 / 待修复 -->

| # | 任务 | 负责人 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | entities: {聚合根} + 值对象 + 测试 | dev | 待办 | |
| 2 | entities: Repository / API 端口类型定义 | dev | 待办 | |
| 3 | shared/api: DTO（Zod schema）+ fetch 封装 + 测试 | dev | 待办 | |
| 4 | features/{slice}/model: store / hook / mapper + 测试 | dev | 待办 | |
| 5 | features/{slice}/api: useXxx mutation / query + MSW 测试 | dev | 待办 | |
| 6 | features/{slice}/ui: 组件 + RTL 测试 | dev | 待办 | |
| 7 | widgets/{name}（如需）+ 组件测试 | dev | 待办 | |
| 8 | app/{route}/page.tsx + layout 装配 | dev | 待办 | |
| 9 | 全量预飞：tsc + vitest + biome + entropy-check | dev | 待办 | |
| 10 | QA: 测试用例设计 | qa | 待办 | |
| 11 | QA: 验收测试 + 代码审查 | qa | 待办 | |
| 12 | QA: E2E（Playwright，≤3 用例） | qa | 待办 | |
| 13 | QA: UI 验收（Preview MCP + gsd:ui-review，当 ui-surface=true） | qa | 待办 | |

<!-- 根据实际需求增减任务行，保持编号连续。ui-surface=false 的任务删除 #13。 -->

## 执行顺序
entities → shared/api → features/model → features/api → features/ui → widgets → app → 全量预飞 → QA 验收 → E2E → UI 验收

## 原子任务分解（每项 10–15 分钟，单会话可完成并 commit）

> **目的**：将上表「按层」的粗粒度任务拆到 10–15 分钟的原子级，便于 Ralph Loop 单轮执行完整交付、便于新会话恢复时定位进度。
>
> **要求**：每个原子任务必填 5 个字段 — `文件路径`、`骨架片段`、`验证命令`、`预期输出`、`commit 消息`。

<!-- 示例格式，按 slice 与层列出。N.M 编号与上表 N 行对齐 -->

### 1.1 entities 值对象 `{ValueObject}`
- **文件**：`src/entities/{aggregate}/model/{valueObject}.ts`
- **测试**：`src/entities/{aggregate}/model/{valueObject}.test.ts`
- **骨架**（Red 阶段先写测试）：
  ```ts
  // {valueObject}.test.ts — 覆盖构造校验 / 相等性 / 不可变
  it('should_throw_when_value_invalid', () => { ... });
  it('should_equal_when_values_match', () => { ... });
  it('should_be_frozen_when_created', () => { ... });
  ```
- **验证命令**：`pnpm vitest run src/entities/{aggregate}/model/{valueObject}.test.ts`
- **预期输出**：`Tests X passed`（先看红再看绿）
- **commit**：`feat({aggregate}): 值对象 {ValueObject}`

### 1.2 entities 聚合根 `{Aggregate}`
- **文件**：`src/entities/{aggregate}/model/{aggregate}.ts`
- **骨架**：静态工厂 `create(...)` / `reconstruct(...)` + 状态转换方法（返回新实例，不 mutate）+ `Object.freeze(this)`
- **验证命令**：`pnpm vitest run src/entities/{aggregate}/`
- **预期输出**：覆盖不变量 / 状态转换 / 异常场景，全部绿
- **commit**：`feat({aggregate}): 聚合根与不变量`

### 2.1 shared/api DTO（Zod schema）
- **文件**：`src/shared/api/dto/{aggregate}.ts`、`{aggregate}.test.ts`
- **骨架**：
  ```ts
  export const XxxRequestSchema = z.object({ ... });
  export type XxxRequestDTO = z.infer<typeof XxxRequestSchema>;
  export const XxxResponseSchema = z.object({ success: z.boolean(), data: z.object({...}) });
  ```
- **验证命令**：`pnpm tsc --noEmit && pnpm vitest run src/shared/api/dto/{aggregate}.test.ts`
- **预期输出**：schema parse 通过所有合法输入 / 拒绝所有非法输入
- **commit**：`feat(shared/api): {aggregate} DTO`

### 2.2 shared/api fetch 封装 + MSW 测试
- **文件**：`src/shared/api/{aggregate}.ts`（或通过 OpenAPI 生成客户端）
- **测试**：MSW 拦截，验证请求 URL / 方法 / body / response 解析
- **验证命令**：`pnpm vitest run src/shared/api/`
- **预期输出**：请求契约与后端 OpenAPI 一致
- **commit**：`feat(shared/api): {aggregate} HTTP 调用`

### 3.1 features/{slice}/model: store / hook
- **文件**：`src/features/{slice}/model/store.ts`、`store.test.ts`
- **骨架**：Zustand `persist` 中间件，状态为 plain DTO（禁存 class 实例）
- **验证命令**：`pnpm vitest run src/features/{slice}/model/`
- **预期输出**：login / logout / 初始状态断言全过
- **commit**：`feat({slice}): auth store`

### 3.2 features/{slice}/api: useXxx mutation
- **文件**：`src/features/{slice}/api/useXxx.ts`、`useXxx.test.ts`
- **测试**：MSW + `@testing-library/react` 的 `renderHook` + `QueryClientProvider` 包裹
- **骨架**：
  ```ts
  export const useLogin = () => useMutation({
    mutationFn: (data: LoginCredentialsDTO) => apiFetch(...),
    onSuccess: (data) => useAuthStore.getState().login(data.data),
  });
  ```
- **验证命令**：`pnpm vitest run src/features/{slice}/api/`
- **预期输出**：成功 → store 更新；401 → token cleared；网络错 → error 捕获
- **commit**：`feat({slice}): useLogin/useRegister/useLogout`

### 4.1 features/{slice}/ui: 表单组件
- **文件**：`src/features/{slice}/ui/XxxForm.tsx`、`XxxForm.test.tsx`
- **测试**：RTL `getByLabelText` / `getByRole` 用户视角；提交按钮禁用状态、错误提示
- **骨架**：React Hook Form + Zod resolver，所有控件来自 `@/shared/ui/*`
- **验证命令**：`pnpm vitest run src/features/{slice}/ui/`
- **预期输出**：表单校验、提交、错误态断言全过
- **commit**：`feat({slice}): XxxForm UI`

### 5.1 app 路由装配
- **文件**：`src/app/{route}/page.tsx`（仅做装配，不写业务）
- **骨架**：`'use client'` + 组合 `features/*` + `widgets/*`；mutation `onSuccess` 里 `router.push`
- **验证命令**：`pnpm tsc --noEmit && pnpm dev`（手动访问页面）
- **预期输出**：页面渲染、基本交互不报错
- **commit**：`feat({slice}): /{route} 页面`

### 6.1 全量预飞
- **命令**：
  ```bash
  pnpm tsc --noEmit
  pnpm vitest run
  pnpm biome check src tests
  ./scripts/entropy-check.sh
  ```
- **预期输出**：四项全过，退出码 0
- **commit**：若有修复 → `chore: 预飞修复`；若全过 → 不产生 commit

<!-- Ralph Loop 执行时：每完成一个原子任务 → 立即 commit → 更新 progress.md [x] -->
<!-- 新会话恢复时：grep 上表状态列「单测通过」即可定位下一个原子任务 -->


## 开发完成记录
<!-- dev 完成后填写 -->
- 全量 `pnpm vitest run`：x/x 用例通过
- tsc / biome / entropy-check：全过
- 通知 @qa 时间：

## QA 验收记录
<!-- qa 验收后填写 -->
- 全量测试（含 E2E）：x/x 用例通过
- 代码审查结果：
- 代码风格检查：
- UI 验收（当 ui-surface=true）：评分 x.x/5
- 问题清单：详见 test-report.md
- **最终状态**：
