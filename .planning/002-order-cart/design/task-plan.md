# 任务执行计划

**任务ID**: 002-order-cart
**计划阶段**: build
**创建时间**: 2025-04-19

---

## 原子任务分解

### Phase 1: Entities 层（Red-Green-Refactor）

#### T1.1: Order 实体 + 值对象
**目标**: 实现 Order 领域模型
**文件**: `src/entities/order/model/order.ts`
**验证**: `pnpm vitest run src/entities/order/model/order.test.ts`

#### T1.2: Order 实体测试
**目标**: 覆盖 Order 所有业务方法
**文件**: `src/entities/order/model/order.test.ts`
**验证**: 测试通过

#### T1.3: Cart 实体 + 值对象
**目标**: 实现 Cart 领域模型
**文件**: `src/entities/cart/model/cart.ts`
**验证**: `pnpm vitest run src/entities/cart/model/cart.test.ts`

#### T1.4: Cart 实体测试
**目标**: 覆盖 Cart 所有业务方法
**文件**: `src/entities/cart/model/cart.test.ts`
**验证**: 测试通过

---

### Phase 2: Shared/API DTO

#### T2.1: Order DTO Schema
**目标**: 定义 Order API 的 Zod schema
**文件**: `src/shared/api/dto/order.ts`
**验证**: TypeScript 类型检查

#### T2.2: Cart DTO Schema
**目标**: 定义 Cart API 的 Zod schema
**文件**: `src/shared/api/dto/cart.ts`
**验证**: TypeScript 类型检查

---

### Phase 3: Features - Cart

#### T3.1: useCart Query Hook
**目标**: 获取购物车数据
**文件**: `src/features/cart/api/useCart.ts`
**验证**: MSW测试 + 联调测试

#### T3.2: useAddToCart Mutation
**目标**: 添加商品到购物车
**文件**: `src/features/cart/api/useAddToCart.ts`
**验证**: MSW测试 + 联调测试

#### T3.3: useUpdateCartItem Mutation
**目标**: 更新购物车商品数量
**文件**: `src/features/cart/api/useUpdateCartItem.ts`
**验证**: MSW测试 + 联调测试

#### T3.4: useRemoveCartItem Mutation
**目标**: 删除购物车商品
**文件**: `src/features/cart/api/useRemoveCartItem.ts`
**验证**: MSW测试 + 联调测试

#### T3.5: useClearCart Mutation
**目标**: 清空购物车
**文件**: `src/features/cart/api/useClearCart.ts`
**验证**: MSW测试 + 联调测试

#### T3.6: Cart Store
**目标**: 本地购物车状态管理
**文件**: `src/features/cart/model/store.ts`
**验证**: 单元测试

#### T3.7: Cart UI Components
**目标**: 购物车UI组件
**文件**:
- `src/features/cart/ui/CartItem.tsx`
- `src/features/cart/ui/CartList.tsx`
- `src/features/cart/ui/CartSummary.tsx`
**验证**: RTL 测试

#### T3.8: Cart Index Export
**目标**: 导出cart slice公共API
**文件**: `src/features/cart/index.ts`

---

### Phase 4: Features - Order

#### T4.1: useOrders Query Hook
**目标**: 获取订单列表
**文件**: `src/features/order/api/useOrders.ts`
**验证**: MSW测试 + 联调测试

#### T4.2: useOrderDetail Query Hook
**目标**: 获取订单详情
**文件**: `src/features/order/api/useOrderDetail.ts`
**验证**: MSW测试 + 联调测试

#### T4.3: useCreateOrder Mutation
**目标**: 创建订单
**文件**: `src/features/order/api/useCreateOrder.ts`
**验证**: MSW测试 + 联调测试

#### T4.4: usePayOrder Mutation
**目标**: 支付订单
**文件**: `src/features/order/api/usePayOrder.ts`
**验证**: MSW测试 + 联调测试

#### T4.5: useCancelOrder Mutation
**目标**: 取消订单
**文件**: `src/features/order/api/useCancelOrder.ts`
**验证**: MSW测试 + 联调测试

#### T4.6: Order Store
**目标**: 订单筛选状态管理
**文件**: `src/features/order/model/store.ts`
**验证**: 单元测试

#### T4.7: Order UI Components
**目标**: 订单UI组件
**文件**:
- `src/features/order/ui/OrderCard.tsx`
- `src/features/order/ui/OrderList.tsx`
- `src/features/order/ui/OrderDetail.tsx`
- `src/features/order/ui/OrderStatusBadge.tsx`
**验证**: RTL 测试

#### T4.8: Order Index Export
**目标**: 导出order slice公共API
**文件**: `src/features/order/index.ts`

---

### Phase 5: Widgets

#### T5.1: CartWidget
**目标**: 购物车页面级组件
**文件**: `src/widgets/CartWidget.tsx`
**验证**: RTL 测试

#### T5.2: OrderWidget
**目标**: 订单列表页面级组件
**文件**: `src/widgets/OrderWidget.tsx`
**验证**: RTL 测试

#### T5.3: OrderDetailWidget
**目标**: 订单详情页面级组件
**文件**: `src/widgets/OrderDetailWidget.tsx`
**验证**: RTL 测试

---

### Phase 6: App 层

#### T6.1: Cart Page
**目标**: 购物车页面
**文件**: `src/app/(authenticated)/cart/page.tsx`
**验证**: 页面渲染测试

#### T6.2: Orders List Page
**目标**: 订单列表页面
**文件**: `src/app/(authenticated)/orders/page.tsx`
**验证**: 页面渲染测试

#### T6.3: Order Detail Page
**目标**: 订单详情页面
**文件**: `src/app/(authenticated)/orders/[id]/page.tsx`
**验证**: 页面渲染测试

---

### Phase 7: 预飞检查

#### T7.1: 类型检查
**命令**: `pnpm tsc --noEmit`
**期望**: 0 errors

#### T7.2: 单元测试
**命令**: `pnpm vitest run`
**期望**: All pass

#### T7.3: 代码风格
**命令**: `pnpm biome check src tests`
**期望**: No issues

#### T7.4: 熵扫描
**命令**: `./scripts/entropy-check.sh`
**期望**: All PASS

---

## 依赖关系

```
T1.1/T1.2/T1.3/T1.4 (Entities)
    ↓
T2.1/T2.2 (DTO)
    ↓
T3.1-T3.8 (Cart features) + T4.1-T4.8 (Order features) 可并行
    ↓
T5.1-T5.3 (Widgets)
    ↓
T6.1-T6.3 (App pages)
    ↓
T7.1-T7.4 (Pre-flight)
```

---

## 变更日志

| 日期 | 变更 |
|------|------|
| 2025-04-19 | 初始计划创建 |
