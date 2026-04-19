# 需求与设计文档

**任务ID**: 002-order-cart
**任务名称**: 订单与购物车功能实现
**创建时间**: 2025-04-19
**状态**: spec

---

## 1. 需求概述

实现电商核心功能：订单管理和购物车管理，对接后端 `/api/v1/orders` 和 `/api/v1/carts` 接口。

### 功能范围

| 模块 | 功能 |
|------|------|
| 购物车 | 查看购物车、添加商品、修改数量、删除商品、清空购物车 |
| 订单 | 创建订单、查看订单列表、查看订单详情、支付订单、取消订单、从购物车创建订单 |

---

## 2. API 对接

### 2.1 购物车 API

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/v1/carts?userId={userId}` | 获取购物车 |
| POST | `/api/v1/carts/items` | 添加商品到购物车 |
| PUT | `/api/v1/carts/items/quantity` | 更新商品数量 |
| DELETE | `/api/v1/carts/items/{productId}?userId={userId}` | 删除商品 |
| DELETE | `/api/v1/carts?userId={userId}` | 清空购物车 |

### 2.2 订单 API

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/v1/orders?customerId={userId}` | 获取订单列表 |
| GET | `/api/v1/orders/{orderId}` | 获取订单详情 |
| POST | `/api/v1/orders` | 直接创建订单 |
| POST | `/api/v1/orders/from-cart` | 从购物车创建订单 |
| POST | `/api/v1/orders/{orderId}/pay` | 支付订单 |
| POST | `/api/v1/orders/{orderId}/cancel` | 取消订单 |

---

## 3. 架构设计

### 3.1 Entities 层

```
entities/
├── order/
│   └── model/
│       ├── order.ts      # Order实体、OrderItem值对象、OrderStatus枚举
│       └── order.test.ts # 实体测试
└── cart/
    └── model/
        ├── cart.ts       # Cart实体、CartItem值对象
        └── cart.test.ts  # 实体测试
```

**设计要点**:
- Order: 封装订单状态转换规则（canPay, canCancel, isFinal）
- Cart: 封装购物车计算逻辑（addItem, updateQuantity, removeItem, clear）
- 全部使用readonly字段，状态变更返回新实例

### 3.2 Features 层

```
features/
├── cart/
│   ├── api/
│   │   ├── useCart.ts          # 获取购物车
│   │   ├── useAddToCart.ts     # 添加商品
│   │   ├── useUpdateCartItem.ts # 更新数量
│   │   ├── useRemoveCartItem.ts # 删除商品
│   │   └── useClearCart.ts     # 清空购物车
│   ├── model/
│   │   └── store.ts            # 本地购物车状态（乐观更新）
│   ├── ui/
│   │   ├── CartItem.tsx        # 购物车商品项
│   │   ├── CartList.tsx        # 购物车列表
│   │   └── CartSummary.tsx     # 购物车汇总
│   └── index.ts
└── order/
    ├── api/
    │   ├── useOrders.ts        # 获取订单列表
    │   ├── useOrderDetail.ts   # 获取订单详情
    │   ├── useCreateOrder.ts   # 创建订单
    │   ├── usePayOrder.ts      # 支付订单
    │   └── useCancelOrder.ts   # 取消订单
    ├── model/
    │   └── store.ts            # 订单相关状态
    ├── ui/
    │   ├── OrderCard.tsx       # 订单卡片
    │   ├── OrderList.tsx       # 订单列表
    │   ├── OrderDetail.tsx     # 订单详情
    │   └── OrderStatusBadge.tsx # 状态标签
    └── index.ts
```

### 3.3 Widgets 层

```
widgets/
├── CartWidget.tsx      # 购物车页面级组件
└── OrderWidget.tsx     # 订单页面级组件
```

### 3.4 App 层

```
app/
├── (authenticated)/
│   ├── cart/
│   │   └── page.tsx    # /cart
│   └── orders/
│       ├── page.tsx    # /orders
│       └── [id]/
│           └── page.tsx # /orders/[id]
```

---

## 4. 数据模型

### 4.1 API Response Schema

```typescript
// CartResponse
{
  userId: string;
  items: CartItemResponse[];
  totalAmount: number;
  currency: string;
  itemCount: number;
  updateTime: string;
}

// CartItemResponse
{
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

// OrderResponse
{
  orderId: string;
  customerId: string;
  status: string;
  totalAmount: number;
  currency: string;
  items: OrderItemResponse[];
  createTime: string;
  updateTime: string;
}
```

### 4.2 领域模型

```typescript
// OrderStatus 枚举
type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

// Order 实体
class Order {
  readonly orderId: string;
  readonly customerId: string;
  readonly status: OrderStatus;
  readonly totalAmount: number;
  readonly currency: string;
  readonly items: OrderItem[];
  readonly createTime: Date;
  readonly updateTime: Date;

  canPay(): boolean;
  canCancel(): boolean;
  isFinal(): boolean;
  withStatus(status: OrderStatus): Order;
}

// Cart 实体
class Cart {
  readonly userId: string;
  readonly items: CartItem[];
  readonly totalAmount: number;
  readonly currency: string;
  readonly itemCount: number;

  addItem(item: CartItemInput): Cart;
  updateQuantity(productId: string, quantity: number): Cart;
  removeItem(productId: string): Cart;
  clear(): Cart;
  isEmpty(): boolean;
}
```

---

## 5. 状态管理

### 5.1 TanStack Query

- **Cart**: queryKey `['cart', userId]`
- **Orders**: queryKey `['orders', userId]`
- **Order Detail**: queryKey `['order', orderId]`

### 5.2 Zustand Store (features)

- cartStore: 本地购物车操作状态（选中商品等）
- orderStore: 订单筛选状态（按状态过滤等）

---

## 6. 验收条件

### 6.1 功能验收

- [ ] 用户可以查看购物车，显示商品列表、数量、单价、小计
- [ ] 用户可以添加商品到购物车
- [ ] 用户可以修改购物车商品数量（1-999）
- [ ] 用户可以删除购物车商品
- [ ] 用户可以清空购物车
- [ ] 用户可以查看订单列表，按状态筛选
- [ ] 用户可以查看订单详情
- [ ] 用户可以从购物车创建订单
- [ ] 用户可以直接创建订单
- [ ] 用户可以支付待支付订单
- [ ] 用户可以取消未发货订单

### 6.2 技术验收

- [ ] entities/ 层测试覆盖 100%
- [ ] features/ API hooks 测试覆盖
- [ ] UI 组件 RTL 测试
- [ ] TypeScript 类型检查通过
- [ ] Biome 代码风格检查通过
- [ ] 熵扫描 13 项通过
- [ ] 联调测试通过（后端可达）

---

## 7. 设计决策

### ADR-001: 购物车使用乐观更新
- **决策**: 购物车操作使用乐观更新，提升用户体验
- **理由**: 购物车操作频繁，需要即时反馈
- **实现**: TanStack Query + Zustand 组合

### ADR-002: 订单状态使用枚举
- **决策**: OrderStatus 使用 union type 枚举
- **理由**: 后端返回字符串状态，前端需要类型安全
- **实现**: 定义 OrderStatus 类型，mapper 中转换

---

## 8. 待确认

无

---

## 9. 参考

- 后端API文档: http://localhost:8080/v3/api-docs
- OpenAPI生成类型: src/shared/api/generated/schema.d.ts
- auth slice 参考实现: src/features/auth/
