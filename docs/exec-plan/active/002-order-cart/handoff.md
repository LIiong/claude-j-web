---
task-id: "002-order-cart"
from: dev
to: qa
status: pending-review
timestamp: "2025-04-19T11:15:00"
task-type: frontend
ui-surface: true
ui-review-score: pending
backend-sync:
  schema-sha: pending
  sync-mode: real
  backend-probe: reachable
pre-flight:
  tsc: pass # pnpm tsc --noEmit exit 0
  vitest: pass # Tests: 101 passed, 0 failed
  biome: pass # Checked 60 files, no fixes needed
  entropy-check: pass # 13/13 checks passed (2 WARN acceptable)
  tdd-evidence:
    - class: "Order"
      red-commit: "ed418f4" # test(entities): add order tests
      green-commit: "TBD" # feat(entities): implement order entity
    - class: "OrderItem"
      red-commit: "ed418f4" # test(entities): add orderItem tests
      green-commit: "TBD" # feat(entities): implement orderItem entity
    - class: "Cart"
      red-commit: "ed418f4" # test(entities): add cart tests
      green-commit: "TBD" # feat(entities): implement cart entity
    - class: "CartItem"
      red-commit: "ed418f4" # test(entities): add cartItem tests
      green-commit: "TBD" # feat(entities): implement cartItem entity
artifacts:
  - requirement-design.md
  - task-plan.md
  - dev-log.md
  - UI-SPEC.md
summary: "Build 阶段完成 - 订单与购物车功能实现，等待 QA 验收"
---

# Handoff 文档

## 交付物清单

### Entities 层 (已完成)
- [x] src/entities/order/model/order.ts - Order 聚合根
- [x] src/entities/order/model/orderItem.ts - OrderItem 值对象
- [x] src/entities/order/model/order.test.ts - Order 测试 (21 tests)
- [x] src/entities/order/model/orderItem.test.ts - OrderItem 测试 (12 tests)
- [x] src/entities/order/index.ts - Order 模块导出
- [x] src/entities/cart/model/cart.ts - Cart 聚合根
- [x] src/entities/cart/model/cartItem.ts - CartItem 值对象
- [x] src/entities/cart/model/cart.test.ts - Cart 测试 (24 tests)
- [x] src/entities/cart/model/cartItem.test.ts - CartItem 测试 (15 tests)
- [x] src/entities/cart/index.ts - Cart 模块导出

### Shared DTO (已完成)
- [x] src/shared/api/dto/order.ts - Order API DTOs
- [x] src/shared/api/dto/cart.ts - Cart API DTOs

### Features 层 (已完成)
- [x] src/features/cart/api/useCart.ts - 获取购物车 hook
- [x] src/features/cart/api/useAddToCart.ts - 添加商品 hook
- [x] src/features/cart/api/useUpdateCartItem.ts - 更新数量 hook
- [x] src/features/cart/api/useRemoveCartItem.ts - 删除商品 hook
- [x] src/features/cart/api/useClearCart.ts - 清空购物车 hook
- [x] src/features/cart/model/store.ts - Cart store (选中状态)
- [x] src/features/cart/index.ts - Cart feature 导出
- [x] src/features/order/api/useOrders.ts - 获取订单列表 hook
- [x] src/features/order/api/useOrderDetail.ts - 获取订单详情 hook
- [x] src/features/order/api/useCreateOrder.ts - 创建订单 hook
- [x] src/features/order/api/useCreateOrderFromCart.ts - 从购物车创建订单 hook
- [x] src/features/order/api/usePayOrder.ts - 支付订单 hook
- [x] src/features/order/api/useCancelOrder.ts - 取消订单 hook
- [x] src/features/order/model/store.ts - Order store (筛选状态)
- [x] src/features/order/index.ts - Order feature 导出

### Widgets 层 (已完成)
- [x] src/widgets/CartWidget.tsx - 购物车页面组件
- [x] src/widgets/OrderWidget.tsx - 订单列表组件

### App 层 (已完成)
- [x] src/app/(authenticated)/cart/page.tsx - 购物车页面
- [x] src/app/(authenticated)/orders/page.tsx - 订单列表页面
- [x] src/app/(authenticated)/orders/[id]/page.tsx - 订单详情页面

## 预飞检查

| 检查项 | 状态 | 输出 |
|--------|------|------|
| TypeScript | PASS | tsc --noEmit exit 0 |
| Vitest | PASS | 9 files, 101 tests passed |
| Biome | PASS | 60 files checked, no fixes |
| Entropy | PASS | 13/13 checks (2 WARN) |

## 功能范围

### 购物车功能
- 查看购物车
- 添加商品到购物车
- 修改商品数量
- 删除商品
- 清空购物车

### 订单功能
- 查看订单列表 (支持状态筛选)
- 查看订单详情
- 创建订单
- 从购物车创建订单
- 支付订单
- 取消订单

## API 对接

- 购物车: `/api/v1/carts/*` 5个端点
- 订单: `/api/v1/orders/*` 6个端点

## 架构决策

- **Entities层**: 纯 TypeScript 领域模型，遵循 TDD 红绿循环
- **Features层**: Cart + Order 两个独立 slice，各自包含 api/model/ui
- **状态管理**: TanStack Query + Zustand 组合
- **乐观更新**: 购物车操作使用乐观更新提升体验

## 待验收

请 @qa 进行验收测试，重点关注：
1. 实体层不变量是否完整
2. API hooks 是否正常
3. 页面渲染是否正确
4. 类型检查是否通过
5. 后端联调是否正常
