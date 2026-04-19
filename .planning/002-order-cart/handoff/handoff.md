# Handoff 文档

**任务ID**: 002-order-cart
**From**: @qa
**To**: @dev
**状态**: changes-requested
**时间**: 2025-04-19

---

## 评审结论

QA 验收发现多个阻塞性问题，需要修复后重新提交验收。

### 预飞检查结果（独立验证）

| 检查项 | 命令 | 结果 | 输出摘要 |
|-------|------|------|---------|
| TypeScript | `pnpm tsc --noEmit` | ✅ PASS | exit 0 |
| Vitest | `pnpm vitest run` | ✅ PASS | Tests: 101 passed, 0 failed |
| Biome | `pnpm biome check src tests` | ✅ PASS | Checked 60 files, no issues |
| entropy-check | `./scripts/entropy-check.sh` | ⚠️ WARN | 11/13 PASS, 2 WARN（历史遗留） |

---

## 问题清单（需修复）

### Critical（阻塞验收）

| # | 问题 | 描述 | 修复建议 |
|---|------|------|----------|
| 1 | DTO → Entity mapper 缺失 | 当前 API hooks 直接返回 DTO，未转换为 Entity | 在 `src/shared/api/mappers/` 或各 feature 下添加 mapper 函数，确保 `API Response ↔ DTO ↔ Entity` 转换链完整 |

### Major（需修复后回归）

| # | 问题 | 描述 | 修复建议 |
|---|------|------|----------|
| 2 | UI 组件缺失 | `features/cart/ui/` 目录为空，`features/order/ui/` 目录不存在 | 按 task-plan.md 实现：CartItem, CartList, CartSummary, OrderCard, OrderList, OrderDetail, OrderStatusBadge |
| 3 | Store 测试缺失 | `useCartStore` 和 `useOrderStore` 无单元测试 | 补充 `store.test.ts`，测试状态变更和持久化逻辑 |
| 4 | API hooks 测试缺失 | 11 个 API hooks 无 MSW 测试 | 补充 hooks 测试，覆盖成功/失败/网络错误场景 |
| 5 | Widgets 测试缺失 | CartWidget, OrderWidget 无 RTL 测试 | 补充组件渲染测试 |
| 6 | OrderDetailWidget 缺失 | task-plan.md T5.3 要求但未实现 | 实现 `src/widgets/OrderDetailWidget.tsx` |
| 7 | API 错误处理缺失 | API hooks 未统一处理错误 | 添加错误处理（toast + 401 跳转） |
| 8 | App Pages 未实现 | task-plan.md T6.1-T6.3 要求但未实现 | 实现 cart page, orders page, order detail page |

### Minor（建议改进）

| # | 问题 | 描述 | 修复建议 |
|---|------|------|----------|
| 9 | Widgets 使用裸 HTML 元素 | 未使用 `@/shared/ui/*` 组件 | 替换为共享 UI 组件（Button, Card, Badge 等） |
| 10 | 硬编码 Tailwind 颜色 | OrderWidget 中使用 `bg-yellow-100` 等硬编码类 | 使用语义 token 或设计系统变量 |

---

## 交付物清单（当前状态）

### ✅ 已完成

| 文件 | 说明 |
|------|------|
| `src/entities/order/model/order.ts` | Order 实体 |
| `src/entities/order/model/orderItem.ts` | OrderItem 值对象 |
| `src/entities/order/model/order.test.ts` | Order 测试（21 cases） |
| `src/entities/order/model/orderItem.test.ts` | OrderItem 测试（12 cases） |
| `src/entities/order/index.ts` | Order 导出 |
| `src/entities/cart/model/cart.ts` | Cart 实体 |
| `src/entities/cart/model/cartItem.ts` | CartItem 值对象 |
| `src/entities/cart/model/cart.test.ts` | Cart 测试（24 cases） |
| `src/entities/cart/model/cartItem.test.ts` | CartItem 测试（15 cases） |
| `src/entities/cart/index.ts` | Cart 导出 |
| `src/shared/api/dto/order.ts` | Order DTO Schema |
| `src/shared/api/dto/cart.ts` | Cart DTO Schema |
| `src/features/cart/api/*.ts` | 5 个 Cart API hooks |
| `src/features/cart/model/store.ts` | Cart Store |
| `src/features/cart/index.ts` | Cart feature 导出 |
| `src/features/order/api/*.ts` | 6 个 Order API hooks |
| `src/features/order/model/store.ts` | Order Store |
| `src/features/order/index.ts` | Order feature 导出 |
| `src/widgets/CartWidget.tsx` | Cart 页面级组件 |
| `src/widgets/OrderWidget.tsx` | Order 页面级组件 |

### ❌ 缺失/未完成

| 文件 | 说明 | 优先级 |
|------|------|--------|
| `src/features/cart/ui/*.tsx` | UI 组件（空目录） | Critical |
| `src/features/order/ui/*.tsx` | UI 组件（目录不存在） | Critical |
| `src/widgets/OrderDetailWidget.tsx` | 订单详情 Widget | Major |
| `src/app/(authenticated)/cart/page.tsx` | 购物车页面 | Major |
| `src/app/(authenticated)/orders/page.tsx` | 订单列表页面 | Major |
| `src/app/(authenticated)/orders/[id]/page.tsx` | 订单详情页面 | Major |
| `src/features/cart/model/store.test.ts` | Cart Store 测试 | Major |
| `src/features/order/model/store.test.ts` | Order Store 测试 | Major |
| `src/features/cart/api/*.test.ts` | Cart API hooks 测试 | Major |
| `src/features/order/api/*.test.ts` | Order API hooks 测试 | Major |
| `src/widgets/*.test.tsx` | Widgets 测试 | Major |

---

## 回归验证清单

修复完成后，QA 将验证以下项目：

- [ ] `pnpm tsc --noEmit` 通过
- [ ] `pnpm vitest run` 通过（新增测试 + 原有测试）
- [ ] `pnpm biome check src tests` 通过
- [ ] `./scripts/entropy-check.sh` 通过（或新增警告可接受）
- [ ] DTO → Entity mapper 实现且测试覆盖
- [ ] UI 组件实现且 RTL 测试通过
- [ ] Store 测试覆盖
- [ ] API hooks 测试覆盖
- [ ] Widgets 测试覆盖
- [ ] App Pages 实现

---

## 交接摘要

@dev Build 阶段部分完成：
- ✅ Entities 层完整实现（Order/Cart + 测试）
- ✅ Shared DTO 层完整实现
- ✅ Features API hooks 层基础实现
- ✅ Features Store 层基础实现
- ✅ Widgets 层部分实现（2/3）
- ❌ Features UI 层未实现
- ❌ App Pages 层未实现
- ❌ Features/Widgets 测试未实现

请按问题清单完成剩余任务后重新提交 QA 验收。

---

## 参考文档

- 测试报告: `docs/exec-plan/active/002-order-cart/test-report.md`
- 测试设计: `docs/exec-plan/active/002-order-cart/test-case-design.md`
- 任务计划: `.planning/002-order-cart/design/task-plan.md`
