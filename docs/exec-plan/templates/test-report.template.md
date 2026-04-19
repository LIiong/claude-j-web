# 测试报告 — {task-id}-{task-name}

**测试日期**：{YYYY-MM-DD}
**测试人员**：@qa
**版本状态**：{待验收 / 验收通过 / 待修复}
**任务类型**：{业务 slice / UI 基础件 / 配置变更 / 基础设施 / 文档}

> **模板使用提示**：
> - **业务 slice 任务**（新增 slice、新增聚合、新增 feature）：填写所有章节
> - **非业务任务**（UI 基础件、配置变更如 env、CI/部署、文档）：可**整节删除**不相关的 N/A 章节
> - 允许删除的章节：二节下的"领域模型检查/对象转换链检查/组件检查"、四节测试金字塔未涉及的层
> - 不允许删除的章节：一（测试执行）、三（代码风格）、五（问题清单）、六（验收结论）—— 任何任务都要留下证据
> - 删除的章节末尾用一行声明替代：`> 本任务不涉及 {章节名}，已按模板说明省略`

---

## 一、测试执行结果

### 自动化检查四项：`pnpm tsc --noEmit && pnpm vitest run && pnpm biome check src tests && ./scripts/entropy-check.sh`

| 检查项 | 命令 | 结果 | 输出摘要 |
|-------|------|------|---------|
| TypeScript | `pnpm tsc --noEmit` | ✅ / ❌ | exit 0 / errors: n |
| Vitest | `pnpm vitest run` | ✅ / ❌ | Tests: X passed, Y failed |
| Biome | `pnpm biome check src tests` | ✅ / ❌ | checked N files, M fixes |
| entropy-check | `./scripts/entropy-check.sh` | ✅ / ❌ | 13/13 checks passed |

### 分层测试（Vitest）

| 层 | 测试文件 | 用例数 | 通过 | 失败 | 耗时 |
|----|---------|--------|------|------|------|
| entities | `src/entities/**/*.test.ts` | | | | |
| features (model) | `src/features/**/model/*.test.ts` | | | | |
| features (api) | `src/features/**/api/*.test.ts` | | | | |
| features (ui) | `src/features/**/ui/*.test.tsx` | | | | |
| widgets | `src/widgets/**/*.test.tsx` | | | | |
| shared | `src/shared/**/*.test.ts` | | | | |
| **合计** | | | | | |

### E2E 测试（Playwright）

| 文件 | 用例数 | 通过 | 失败 | 耗时 |
|------|--------|------|------|------|
| `tests/e2e/{name}.spec.ts` | | | | |

| **总计** | **x 个测试文件** | **x** | **x** | **0** | **~xs** |

### 测试用例覆盖映射

| 设计用例 | 对应测试文件 → 方法 | 状态 |
|----------|---------------------|------|
| E1-Ex | `{entity}.test.ts` (x cases) | ✅ / ❌ |
| F1-Fx | `useXxx.test.ts` / `store.test.ts` (x cases) | ✅ / ❌ |
| U1-Ux | `{Component}.test.tsx` (x cases) | ✅ / ❌ |
| P1-Px | `tests/e2e/{name}.spec.ts` (x cases) | ✅ / ❌ |

---

## 二、代码审查结果

### 依赖方向检查（FSD）

| 检查项 | 结果 | 说明 |
|--------|------|------|
| `app → widgets`（不依赖反向） | ✅ / ⚠️ | |
| `widgets → features`（不依赖反向） | ✅ / ⚠️ | |
| `features → entities`（不依赖反向、不跨 slice） | ✅ / ⚠️ | |
| `entities` 零 React / Next / 状态库 import | ✅ / ⚠️ | |
| `shared` 不反向依赖业务层 | ✅ / ⚠️ | |
| `pnpm exec depcruise src` 全过 | ✅ / ⚠️ | |

### 领域模型检查

| 检查项 | 结果 |
|--------|------|
| entities 无 `react` / `next/*` / `zustand` / `@tanstack/*` import | |
| 聚合根封装业务不变量（非贫血模型） | |
| 值对象不可变（`readonly` + `Object.freeze` 或等价） | |
| 值对象 `equals()` 方法正确 | |
| Repository 接口类型在业务层、实现走 `shared/api` | |

### 对象转换链检查

| 转换 | 方式 | 结果 |
|------|------|------|
| API Response → DTO | Zod `schema.parse()` | |
| DTO → Entity | mapper 函数（`toXxx` / `fromXxx`） | |
| Entity → UI Model | 组件内解构 / selector | |
| `fetch(` 仅出现在 `src/shared/api/` | grep 校验 | |
| Zustand store 不存 class 实例（JSON 可序列化） | | |

### 组件检查

| 检查项 | 结果 |
|--------|------|
| React 组件无业务逻辑（只描述 UI） | |
| 错误统一处理（api 401 跳登录 / 业务错误 toast / Boundary 兜底） | |
| HTTP 状态码与 UI 反馈一致 | |
| 表单使用 `react-hook-form + zod` | |

---

## 三、代码风格检查结果

| 检查项 | 结果 |
|--------|------|
| TS strict（无 `any`、无裸 `// @ts-ignore`） | |
| 命名导出（entities/features/widgets 禁 `export default`） | |
| slice 结构 `ui/` + `model/` + `api/` + `index.ts` | |
| 组件来自 `@/shared/ui/*`（ui-surface=true 任务） | |
| Tailwind 语义 token（禁硬编码颜色/像素） | |
| 测试命名 `should_xxx_when_yyy`（全小写下划线） | |
| Biome 通过（lint + format） | |

---

## 四、测试金字塔合规

| 层 | 测试类型 | 框架 | Mock / Isolation | 结果 |
|---|---------|------|------------------|------|
| entities | 纯单元 | Vitest | 无 React / MSW | |
| features (model) | 单元 | Vitest | store / mapper 纯函数 | |
| features (api) | 单元 | Vitest + MSW | MSW 拦截 HTTP | |
| features (ui) | 组件 | Vitest + RTL + jsdom | MSW + mock store（必要时） | |
| widgets | 组件组合 | Vitest + RTL | 同上 | |
| **E2E** | **端到端** | **Playwright** | **真实浏览器** | |

---

## 五、问题清单

<!-- 严重度：Critical（阻塞验收）/ Major（需修复后回归）/ Minor（建议改进，不阻塞） -->

| # | 严重度 | 描述 | 处理 |
|---|--------|------|------|
| 1 | {Critical/Major/Minor} | {问题描述} | {处理方式} |

**{阻塞性问题数量}个阻塞性问题，{改进建议数量}个改进建议。**

---

## 六、验收结论

| 维度 | 结论 |
|------|------|
| 功能完整性 | {✅ / ❌} {说明} |
| 测试覆盖 | {✅ / ❌} x 个测试文件，覆盖 x 层 |
| 架构合规 | {✅ / ❌} {说明} |
| 代码风格 | {✅ / ❌} {说明} |
| UI 验收（ui-surface=true） | {✅ / ❌ / N/A} 评分 x.x/5 |

### 最终状态：{✅ 验收通过 / ❌ 待修复 — 见问题清单}

<!-- 验收通过后填写 -->
可归档至 `docs/exec-plan/archived/{task-id}-{task-name}/`。
