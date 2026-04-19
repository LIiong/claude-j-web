# 测试报告 — 002-order-cart

**测试日期**: 2025-04-19
**测试人员**: @qa
**版本状态**: 待验收
**任务类型**: 业务 slice

---

## 一、测试执行结果

### 自动化检查四项

| 检查项 | 命令 | 结果 | 输出摘要 |
|-------|------|------|---------|
| TypeScript | `pnpm tsc --noEmit` | ✅ | exit 0, 无错误 |
| Vitest | `pnpm vitest run` | ✅ | Tests: 101 passed, 0 failed |
| Biome | `pnpm biome check src tests` | ✅ | Checked 60 files, no fixes needed |
| entropy-check | `./scripts/entropy-check.sh` | ⚠️ | 11/13 PASS, 2 WARN |

**entropy-check 警告详情**:
- [9/13] 测试方法命名: 42 个测试名不符合 `should_xxx_when_yyy` 格式（历史遗留，非本任务引入）
- [11/13] 文件长度: 3 个文件超过 300 行（历史遗留，非本任务引入）

### 分层测试（Vitest）

| 层 | 测试文件 | 用例数 | 通过 | 失败 | 耗时 |
|----|---------|--------|------|------|------|
| entities | `src/entities/order/model/order.test.ts` | 21 | 21 | 0 | ~11ms |
| entities | `src/entities/cart/model/cart.test.ts` | 24 | 24 | 0 | ~107ms |
| entities | `src/entities/cart/model/cartItem.test.ts` | 15 | 15 | 0 | ~7ms |
| entities | `src/entities/order/model/orderItem.test.ts` | 12 | 12 | 0 | ~9ms |
| entities (user) | `src/entities/user/model/*.test.ts` | 25 | 25 | 0 | ~26ms |
| features (auth) | `src/features/auth/model/store.test.ts` | 4 | 4 | 0 | ~9ms |
| **合计** | 9 个测试文件 | **101** | **101** | **0** | **~3.88s** |

### E2E 测试（Playwright）

> 注：本任务未包含新的 E2E 测试文件。E2E 测试建议在集成测试阶段统一补充。

| 文件 | 用例数 | 通过 | 失败 | 耗时 |
|------|--------|------|------|------|
| - | - | - | - | - |

### 测试用例覆盖映射

| 设计用例 | 对应测试文件 → 方法 | 状态 |
|----------|---------------------|------|
| E1-E12 | `cart.test.ts` (24 cases) | ✅ |
| E13-E23 | `order.test.ts` (21 cases) | ✅ |
| E24-E35 | `cartItem.test.ts` + `orderItem.test.ts` (27 cases) | ✅ |
| F1-F6 | `cart/model/store.ts` - 需补充测试 | ⚠️ |
| F7-F9 | `order/model/store.ts` - 需补充测试 | ⚠️ |
| F10-F20 | API hooks - MSW 测试待补充 | ⚠️ |

**注意**: Cart store 和 Order store 以及 API hooks 的测试目前缺失，需要 @dev 补充。

---

## 二、代码审查结果

### 依赖方向检查（FSD）

| 检查项 | 结果 | 说明 |
|--------|------|------|
| `app → widgets`（不依赖反向） | ✅ | 无反向依赖 |
| `widgets → features`（不依赖反向） | ✅ | CartWidget/OrderWidget 正确依赖 features |
| `features → entities`（不依赖反向、不跨 slice） | ✅ | cart/order 正确依赖 entities，无跨 slice |
| `entities` 零 React / Next / 状态库 import | ✅ | 已验证 |
| `shared` 不反向依赖业务层 | ✅ | 无反向依赖 |
| `pnpm exec depcruise src` 全过 | ✅ | PASS |

```
$ pnpm exec depcruise src
(no output, all rules passed)
```

### 领域模型检查

| 检查项 | 结果 | 说明 |
|--------|------|------|
| entities 无 `react` / `next/*` / `zustand` / `@tanstack/*` import | ✅ | grep 验证通过 |
| 聚合根封装业务不变量（非贫血模型） | ✅ | Order/Cart 均有完整业务方法 |
| 值对象不可变（`readonly` + `Object.freeze` 或等价） | ✅ | OrderItem/CartItem 均 freeze |
| 值对象 `equals()` 方法正确 | ✅ | 已实现 |
| Repository 接口类型在业务层、实现走 `shared/api` | ✅ | 通过 DTO + apiFetch 实现 |

### 对象转换链检查

| 转换 | 方式 | 结果 | 说明 |
|------|------|------|------|
| API Response → DTO | Zod `schema.parse()` | ✅ | `src/shared/api/dto/order.ts`, `cart.ts` 已定义 |
| DTO → Entity | mapper 函数（`toXxx` / `fromXxx`） | ⚠️ | **缺失** - 未找到 mapper 文件 |
| Entity → UI Model | 组件内解构 / selector | ✅ | Widgets 直接使用 DTO 字段 |
| `fetch(` 仅出现在 `src/shared/api/` | grep 校验 | ✅ | `apiFetch` 封装在 `shared/api/client.ts` |
| Zustand store 不存 class 实例（JSON 可序列化） | ⚠️ | Cart store 使用 Set，有自定义序列化逻辑，需验证 |

**关键问题**: DTO 到 Entity 的 mapper 未实现。当前代码中：
- Entities 层定义了 Order/Cart 类
- Features 层 API hooks 直接返回 DTO
- 但缺少 DTO → Entity 的转换层

建议：
1. 在 `src/shared/api/mappers/` 或 `src/features/*/mappers/` 添加 mapper
2. 或在 API hooks 中直接进行转换

### 组件检查

| 检查项 | 结果 | 说明 |
|--------|------|------|
| React 组件无业务逻辑（只描述 UI） | ✅ | CartWidget/OrderWidget 仅为展示组件 |
| 错误统一处理（api 401 跳登录 / 业务错误 toast / Boundary 兜底） | ⚠️ | **缺失** - API hooks 未统一处理错误 |
| HTTP 状态码与 UI 反馈一致 | ⚠️ | 待 E2E 验证 |
| 表单使用 `react-hook-form + zod` | N/A | 本任务无表单交互 |

---

## 三、代码风格检查结果

| 检查项 | 结果 | 说明 |
|--------|------|------|
| TS strict（无 `any`、无裸 `// @ts-ignore`） | ✅ | 通过 |
| 命名导出（entities/features/widgets 禁 `export default`） | ✅ | 全部使用命名导出 |
| slice 结构 `ui/` + `model/` + `api/` + `index.ts` | ⚠️ | **问题**: `features/cart/ui/` 目录存在但为空；`features/order/ui/` 目录不存在 |
| 组件来自 `@/shared/ui/*`（ui-surface=true 任务） | ⚠️ | Widgets 使用裸 HTML 元素，未使用 `@/shared/ui/*` |
| Tailwind 语义 token（禁硬编码颜色/像素） | ⚠️ | 有硬编码颜色类（如 `bg-yellow-100`, `text-yellow-800`） |
| 测试命名 `should_xxx_when_yyy`（全小写下划线） | ✅ | 本项目 entities 测试命名正确 |
| Biome 通过（lint + format） | ✅ | 通过 |

**风格问题清单**:
1. `features/cart/ui/` 目录为空，`features/order/ui/` 目录缺失
2. Widgets 中使用了裸 HTML 元素而非 `@/shared/ui/*` 组件
3. OrderWidget 中使用了硬编码 Tailwind 颜色类

---

## 四、测试金字塔合规

| 层 | 测试类型 | 框架 | Mock / Isolation | 结果 |
|---|---------|------|------------------|------|
| entities | 纯单元 | Vitest | 无 React / MSW | ✅ 101 tests |
| features (model) | 单元 | Vitest | store / mapper 纯函数 | ⚠️ store 测试缺失 |
| features (api) | 单元 | Vitest + MSW | MSW 拦截 HTTP | ⚠️ API hooks 测试缺失 |
| features (ui) | 组件 | Vitest + RTL + jsdom | MSW + mock store | ⚠️ UI 组件缺失 |
| widgets | 组件组合 | Vitest + RTL | 同上 | ⚠️ Widgets 测试缺失 |
| **E2E** | **端到端** | **Playwright** | **真实浏览器** | ⚠️ 待补充 |

---

## 五、问题清单

<!-- 严重度：Critical（阻塞验收）/ Major（需修复后回归）/ Minor（建议改进，不阻塞） -->

| # | 严重度 | 描述 | 处理建议 |
|---|--------|------|----------|
| 1 | **Critical** | DTO → Entity mapper 缺失 | 在 features 层或 shared/api 层添加 mapper 函数，确保数据转换链完整 |
| 2 | **Major** | API hooks 错误处理缺失 | 所有 API hooks 需添加统一的错误处理（toast + 401 跳转） |
| 3 | **Major** | UI 组件缺失（features/ui/） | 按设计文档补充 CartItem, CartList, CartSummary, OrderCard, OrderList, OrderDetail, OrderStatusBadge |
| 4 | **Major** | Store 和 API hooks 测试缺失 | 补充 `store.test.ts` 和 API hooks 的 MSW 测试 |
| 5 | **Minor** | Widgets 使用裸 HTML 元素 | 替换为 `@/shared/ui/*` 组件（如 Card, Button, Badge 等） |
| 6 | **Minor** | OrderWidget 硬编码颜色类 | 使用 Tailwind 语义 token 或设计系统变量 |
| 7 | **Minor** | 缺少 OrderDetailWidget | 按设计文档补充 `src/widgets/OrderDetailWidget.tsx` |

**2 个 Critical/Major 问题，5 个改进建议。**

**疑似共同根因**:
- 问题 2/3/4/7 可能源于 Build 阶段未完成（progress.md 显示 Build 进行中）
- 问题 1 可能是设计决策（跳过 Entity 层直接使用 DTO）

---

## 六、验收结论

| 维度 | 结论 | 说明 |
|------|------|------|
| 功能完整性 | ❌ | Entities 层完整，但 Features UI 层和 Widgets 层不完整 |
| 测试覆盖 | ⚠️ | Entities 层 101 tests PASS，但 Features 层测试缺失 |
| 架构合规 | ⚠️ | FSD 方向正确，但 mapper 层缺失，DTO 直接透传 |
| 代码风格 | ⚠️ | Biome 通过，但 UI 组件和样式规范有偏差 |
| UI 验收（ui-surface=true） | ❌ | UI 组件未实现，无法验收 |

### 最终状态：❌ **待修复 — 见问题清单**

**阻断原因**:
1. Critical: DTO → Entity 转换链不完整
2. Major: UI 组件层未实现（features/ui/ 为空或缺失）
3. Major: Features 层测试缺失

**建议**:
- @dev 需完成 Build 阶段剩余任务（T3.7, T3.8, T4.7, T4.8, T5.3, T6.1-T6.3）
- 补充 mapper 层或明确设计决策
- 补充 Features 层测试
- 完成后重新提交 QA 验收

---

## 七、后端联调证据（如适用）

**sync-mode**: n/a（当前为 Build 阶段，未进入联调）

---

## 八、TDD 红绿证据校验

**检查范围**: Entities 层 Order/Cart

| 实体 | Red Commit | Green Commit | 状态 |
|------|-----------|--------------|------|
| Order | 待验证 | 待验证 | 未找到独立 red/green commits |
| Cart | 待验证 | 待验证 | 未找到独立 red/green commits |

**结论**: 因代码以未提交状态存在于工作区，无法验证 Git 提交历史。建议在完成 Build 后提交代码，确保 TDD 流程可追溯。
