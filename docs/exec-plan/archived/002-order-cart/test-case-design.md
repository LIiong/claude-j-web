# 测试用例设计 — 002-order-cart

## 测试范围
订单与购物车功能实现验收测试，覆盖 entities、features、widgets 层及集成测试。


## 测试策略
按测试金字塔分层测试 + 代码审查 + 风格检查。

---

## 0. AC 自动化覆盖矩阵（强制，动笔前先填）

> **规则**：
> 1. 列出 `requirement-design.md#验收标准` 的每一条 AC
> 2. 每条必须映射到至少 1 个自动化测试（哪一层、哪个测试方法名）
> 3. 若标「手动」，必须说明**为什么不能自动化** + **替代自动化测试**（即便是弱化版）

| # | 验收条件（AC） | 自动化层 | 对应测试方法 | 手动备注（若有） |
|---|---|---|---|---|
| AC1 | 用户可以查看购物车，显示商品列表、数量、单价、小计 | features (RTL) | `CartWidget` 渲染测试 | - |
| AC2 | 用户可以添加商品到购物车 | entities | `cart.test.ts → should_add_new_item_to_cart` | - |
| AC3 | 用户可以修改购物车商品数量（1-999） | entities | `cart.test.ts → should_update_quantity_when_item_exists` | - |
| AC4 | 用户可以删除购物车商品 | entities | `cart.test.ts → should_remove_item_when_exists` | - |
| AC5 | 用户可以清空购物车 | entities | `cart.test.ts → should_remove_all_items` | - |
| AC6 | 用户可以查看订单列表，按状态筛选 | features (RTL) | `OrderWidget` 渲染 + 筛选测试 | - |
| AC7 | 用户可以查看订单详情 | E2E / features | `useOrderDetail` + 页面渲染 | - |
| AC8 | 用户可以从购物车创建订单 | features | `useCreateOrderFromCart` hook | - |
| AC9 | 用户可以直接创建订单 | features | `useCreateOrder` hook | - |
| AC10 | 用户可以支付待支付订单 | entities | `order.test.ts → canPay 状态检查` | - |
| AC11 | 用户可以取消未发货订单 | entities | `order.test.ts → canCancel 状态检查` | - |

**反模式（禁止）**：
- 本项目 entities 层测试已完整覆盖所有业务规则

---

## 一、entities 层测试场景

<!-- 纯单元测试，Vitest；禁 React / @testing-library / MSW / fetch import -->

### Cart 聚合根
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| E1 | 合法值创建 | - | `Cart.create(valid)` | 创建成功 + 字段只读 |
| E2 | 非法值 - 空 userId | - | `Cart.create({userId: ''})` | 抛 Error('Cart.userId is required') |
| E3 | 非法值 - 空 currency | - | `Cart.create({currency: ''})` | 抛 Error('Cart.currency is required') |
| E4 | 空购物车 | - | `Cart.create({items: []})` | `isEmpty() === true` |
| E5 | 不可变性 | - | 创建后修改 | `Object.isFrozen(cart) === true` |
| E6 | 添加新商品 | 空购物车 | `addItem(newItem)` | 商品添加到列表，总数更新 |
| E7 | 合并已有商品 | 已有该商品 | `addItem(sameItem)` | 数量合并，不重复添加 |
| E8 | 更新数量 | 商品存在 | `updateQuantity(id, 5)` | 数量更新，小计重算 |
| E9 | 数量为0时移除 | 商品存在 | `updateQuantity(id, 0)` | 商品从购物车移除 |
| E10 | 删除商品 | 商品存在 | `removeItem(id)` | 商品移除，总数更新 |
| E11 | 清空购物车 | 有商品 | `clear()` | 所有商品移除，金额归零 |
| E12 | 数量上限检查 | - | 添加超过999数量 | 抛 Error('Quantity exceeds maximum allowed') |

### Order 聚合根
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| E13 | 合法值创建 | - | `Order.create(valid)` | 创建成功 + 字段只读 |
| E14 | 非法值 - 空 orderId | - | `Order.create({orderId: ''})` | 抛 Error('Order.orderId is required') |
| E15 | 非法值 - 负数金额 | - | `Order.create({totalAmount: -1})` | 抛 Error('Order.totalAmount cannot be negative') |
| E16 | 非法值 - 空商品列表 | - | `Order.create({items: []})` | 抛 Error('Order.items cannot be empty') |
| E17 | 可支付检查 | status=PENDING_PAYMENT | `canPay()` | `true` |
| E18 | 不可支付检查 | status=PAID/CANCELLED | `canPay()` | `false` |
| E19 | 可取消检查 | status=PENDING_PAYMENT/PAID/PROCESSING | `canCancel()` | `true` |
| E20 | 不可取消检查 | status=SHIPPED/DELIVERED/CANCELLED | `canCancel()` | `false` |
| E21 | 终态检查 | status=DELIVERED/CANCELLED/REFUNDED | `isFinal()` | `true` |
| E22 | 非终态检查 | status=PENDING_PAYMENT/PAID/PROCESSING/SHIPPED | `isFinal()` | `false` |
| E23 | 状态更新 | - | `withStatus(newStatus)` | 返回新实例，原实例不变 |

---

## 二、features 层测试场景（model / api）

<!-- Vitest + MSW；hook 测试使用 renderHook + QueryClientProvider 包裹 -->

### Cart Store (model)
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| F1 | store 初始状态 | - | `useCartStore.getState()` | `selectedItems: Set()` 空集合 |
| F2 | 切换商品选中 | - | `toggleItemSelection(id)` | 商品切换选中状态 |
| F3 | 全选商品 | - | `selectAll([id1, id2])` | 所有指定商品被选中 |
| F4 | 取消全选 | 有选中商品 | `deselectAll()` | 选中集合清空 |
| F5 | 检查选中状态 | 商品已选中 | `isSelected(id)` | `true` |
| F6 | 持久化恢复 | 刷新页面 | 重新加载 | Set 正确反序列化 |

### Order Store (model)
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| F7 | 初始筛选状态 | - | `useOrderStore.getState()` | `filters: {}` 无筛选 |
| F8 | 设置状态筛选 | - | `setStatusFilter('PAID')` | `filters.status === 'PAID'` |
| F9 | 清除状态筛选 | 已设置筛选 | `setStatusFilter(undefined)` | `filters.status === undefined` |

### API Hooks (TanStack Query)
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| F10 | 获取购物车 | MSW 返回 200 | `useCart(userId)` | 返回购物车数据 |
| F11 | 添加商品到购物车 | MSW 返回 200 | `useAddToCart().mutate(item)` | 成功后 invalidate cart query |
| F12 | 更新商品数量 | MSW 返回 200 | `useUpdateCartItem().mutate({id, qty})` | 成功后刷新购物车 |
| F13 | 删除商品 | MSW 返回 200 | `useRemoveCartItem().mutate(id)` | 成功后刷新购物车 |
| F14 | 清空购物车 | MSW 返回 200 | `useClearCart().mutate(userId)` | 成功后刷新购物车 |
| F15 | 获取订单列表 | MSW 返回 200 | `useOrders(userId)` | 返回订单列表 |
| F16 | 获取订单详情 | MSW 返回 200 | `useOrderDetail(orderId)` | 返回订单详情 |
| F17 | 创建订单 | MSW 返回 200 | `useCreateOrder().mutate(order)` | 成功后 invalidate orders query |
| F18 | 从购物车创建订单 | MSW 返回 200 | `useCreateOrderFromCart().mutate({userId})` | 成功后 invalidate 多个 query |
| F19 | 支付订单 | MSW 返回 200 | `usePayOrder().mutate(orderId)` | 成功后 invalidate order query |
| F20 | 取消订单 | MSW 返回 200 | `useCancelOrder().mutate(orderId)` | 成功后 invalidate order query |

---

## 三、features / widgets UI 测试场景

<!-- RTL + jsdom；用户视角查询（getByRole / getByLabelText），禁 querySelector 实现细节 -->

| # | 场景 | 操作 | 预期结果 |
|---|------|------|----------|
| U1 | CartWidget 渲染空购物车 | render `<CartWidget />` (无数据) | 显示 "Your cart is empty" |
| U2 | CartWidget 渲染有商品 | render `<CartWidget />` (有数据) | 显示商品列表、数量、小计、总计 |
| U3 | CartWidget 加载状态 | render `<CartWidget />` (loading) | 显示 "Loading cart..." |
| U4 | OrderWidget 渲染订单列表 | render `<OrderWidget />` | 显示订单列表，含状态标签、金额 |
| U5 | OrderWidget 筛选功能 | 选择状态筛选 | 列表按状态过滤 |
| U6 | OrderWidget 空状态 | 无订单数据 | 显示 "No orders found" |
| U7 | OrderWidget 加载状态 | 加载中 | 显示 "Loading orders..." |

---

## 四、E2E 测试场景（Playwright，≤3 用例）

<!-- tests/e2e/**/*.spec.ts；覆盖核心用户流；禁止重复覆盖其他 slice -->

| # | 场景 | 操作 | 预期结果 |
|---|------|------|----------|
| P1 | 购物车到订单主流程 | 登录 → 添加商品 → 查看购物车 → 创建订单 → 查看订单 | 各页面正常显示，数据正确 |
| P2 | 订单支付和取消 | 创建待支付订单 → 支付 → 验证状态 → 创建新订单 → 取消 | 状态转换正确 |
| P3 | 购物车操作持久化 | 添加商品 → 刷新 → 验证商品仍在 | 数据跨刷新保持 |

---

## 五、UI 验收用例（仅当 ui-surface=true）

参照 `docs/exec-plan/templates/ui-verification-report.template.md`：
- 每关键页面 × 3 断点（mobile/tablet/desktop）截图
- 每条交互流 preview_click / preview_fill 驱动 + 终态截图
- console 无 error 日志
- `gsd:ui-review` 6 维评分 ≥3/5

---

## 六、代码审查检查项

- [ ] FSD 依赖方向正确（`app → widgets → features → entities ← shared`）
- [ ] entities 模块无 `react` / `next/*` / `zustand` / `@tanstack/*` import
- [ ] 聚合根封装业务不变量（非贫血模型），状态变更通过命名方法
- [ ] 值对象不可变（`readonly` 字段 + `Object.freeze` 或等价）
- [ ] `fetch(` 仅出现在 `src/shared/api/`
- [ ] 对象转换链完整：API Response ↔ DTO (Zod) ↔ Entity ↔ UI Model
- [ ] React 组件无业务逻辑（组件层只描述 UI，逻辑在 hook / store / entity）
- [ ] 错误统一处理（api client 401 跳登录；业务错误 toast；Boundary 兜底）
- [ ] Zustand store 若 `persist` 中间件：状态必须是 plain DTO / JSON 可序列化

## 七、代码风格检查项

- [ ] TS strict mode（无裸 `any`、无 `// @ts-ignore`）
- [ ] 命名导出（entities/features/widgets 禁 `export default`）
- [ ] slice 结构：`ui/` + `model/` + `api/` + `index.ts` public API
- [ ] 组件来自 `@/shared/ui/*`，禁裸 `<button>` / `<input>`（ui-surface=true 任务）
- [ ] 样式通过 Tailwind 语义 token，禁硬编码颜色/像素
- [ ] 测试命名 `should_xxx_when_yyy`（全小写下划线；entropy-check 规则 #9）
