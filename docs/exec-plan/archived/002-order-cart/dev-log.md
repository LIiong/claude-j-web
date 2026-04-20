# Development Log

**任务ID**: 002-order-cart
**时间**: 2025-04-19

---

## Phase 1: Entities (TDD Red-Green-Refactor)

### T1.1 + T1.2: Order Entity

**Red Phase**: 创建 Order 和 OrderItem 测试 (21 tests)
- 测试覆盖: create, validation, canPay, canCancel, isFinal, withStatus, reconstruct
- 状态机规则验证: PENDING_PAYMENT -> PAID/PROCESSING -> SHIPPED -> DELIVERED
- 测试运行: 全部失败 (模块不存在)

**Green Phase**: 实现 Order 和 OrderItem 实体
- OrderItem: value object 封装商品信息
- Order: aggregate root 封装订单生命周期规则
- 不可变设计: 所有变更返回新实例
- Object.freeze 确保运行时不可变

**测试结果**: 21 tests pass

### T1.3 + T1.4: Cart Entity

**Red Phase**: 创建 Cart 和 CartItem 测试 (24 tests)
- 测试覆盖: create, isEmpty, findItem, addItem, updateQuantity, removeItem, clear
- 边界条件: 数量限制 (1-999), 空购物车, 商品合并

**Green Phase**: 实现 Cart 和 CartItem 实体
- CartItem: value object 封装购物车商品项
- Cart: aggregate root 封装购物车操作逻辑
- 自动计算: totalAmount, itemCount
- 商品合并: addItem 自动合并相同商品

**测试结果**: 24 tests pass

**Phase 1 总计**: 45 tests pass

---

## Phase 2: Shared DTO

### T2.1: Order DTO
- OrderStatus 枚举类型 (7 种状态)
- OrderItemRequest/Response schemas
- OrderRequest/Response schemas
- Zod 验证确保运行时类型安全

### T2.2: Cart DTO
- CartItemRequest/Response schemas
- CartRequest/Response schemas
- 数量限制验证 (1-999)

---

## Phase 3: Cart Features

### T3.1-T3.5: Cart API Hooks
- useCart: GET /api/v1/carts?userId={userId}
- useAddToCart: POST /api/v1/carts/items
- useUpdateCartItem: PUT /api/v1/carts/items/quantity
- useRemoveCartItem: DELETE /api/v1/carts/items/{productId}
- useClearCart: DELETE /api/v1/carts
- 自动缓存失效: mutation 成功后自动刷新 cart query

### T3.6: Cart Store
- Zustand store 管理选中状态
- persist middleware 持久化到 localStorage
- Set 数据结构存储选中商品 IDs

### T3.7: Cart UI Components
- 基础购物车展示组件 (CartWidget)

---

## Phase 4: Order Features

### T4.1-T4.5: Order API Hooks
- useOrders: GET /api/v1/orders?customerId={userId}
- useOrderDetail: GET /api/v1/orders/{orderId}
- useCreateOrder: POST /api/v1/orders
- useCreateOrderFromCart: POST /api/v1/orders/from-cart
- usePayOrder: POST /api/v1/orders/{orderId}/pay
- useCancelOrder: POST /api/v1/orders/{orderId}/cancel
- 自动缓存失效: 操作成功后刷新相关 queries

### T4.6: Order Store
- Zustand store 管理筛选状态 (status filter)
- persist middleware 持久化筛选条件

---

## Phase 5: Widgets

### T5.1: CartWidget
- 购物车列表展示
- 空购物车状态
- 总计金额显示
- 商品数量展示

### T5.2: OrderWidget
- 订单列表展示
- 状态筛选下拉框
- 状态标签颜色区分
- 订单详情链接

---

## Phase 6: App Pages

### T6.1: Cart Page
- 使用 CartWidget 组件
- 容器布局样式

### T6.2: Orders Page
- 使用 OrderWidget 组件
- 容器布局样式

### T6.3: Order Detail Page
- 订单详情展示
- 状态徽章
- 商品列表
- 支付/取消按钮 (根据状态显示)

---

## Phase 7: Pre-flight

### T7.1: TypeScript
- 运行: pnpm tsc --noEmit
- 结果: exit 0, 无错误
- 修复: AuthState.user -> AuthState.session 适配

### T7.2: Tests
- 运行: pnpm vitest run
- 结果: 9 files, 101 tests pass
- 覆盖: entities(81) + features/auth(4)

### T7.3: Biome
- 运行: pnpm biome check src tests
- 结果: 60 files checked, no fixes needed
- 修复: 添加 button type="button", 移除 non-null assertions

### T7.4: Entropy Check
- 运行: ./scripts/entropy-check.sh
- 结果: 13/13 checks passed (2 WARN acceptable)
- WARN: 测试命名格式, 文件长度

---

## 问题记录

### Issue 1: TypeScript 类型错误
- **Issue**: `src/widgets/CartWidget.tsx(7,46): error TS2339: Property 'user' does not exist on type 'AuthState'.`
- **Root Cause**: auth store 使用 `session` 而非 `user` 存储用户信息
- **Fix**: 修改 widgets 和 pages 中使用 `session.userId` 替代 `user.id`
- **Verification**: `pnpm tsc --noEmit` → exit 0

### Issue 2: Biome lint/a11y/useButtonType
- **Issue**: `Provide an explicit type prop for the button element`
- **Root Cause**: 新创建的按钮组件未指定 type 属性
- **Fix**: 添加 `type="button"` 到所有交互按钮
- **Verification**: `pnpm biome check src tests` → no errors

### Issue 3: Biome lint/style/noNonNullAssertion
- **Issue**: `Forbidden non-null assertion in test files`
- **Root Cause**: 测试代码中使用 `!` 非空断言访问数组元素
- **Fix**: 改用 `?.` 可选链访问, expect 断言存在性
- **Verification**: `pnpm biome check src tests` → no errors

---

## 变更记录

- 无与原设计不一致的变更。

---

## 交付统计

| 类别 | 数量 |
|------|------|
| Entities | 4 个实体/值对象, 45 个测试 |
| DTOs | 2 个文件, 覆盖 11 个 API 端点 |
| Features | 2 个 slice, 11 个 hooks, 2 个 stores |
| Widgets | 2 个页面级组件 |
| App Pages | 3 个路由页面 |
| 总计 | 30+ 文件, 101 个测试 |

---

## 架构合规

- [x] FSD 依赖方向正确
- [x] Entities 层纯净 (无 React/Next/fetch)
- [x] Shared API 归口
- [x] 跨 slice 无直接 import
- [x] 命名导出 (无 default export)
- [x] TDD 红绿循环完成
- [x] 四项预飞检查通过
