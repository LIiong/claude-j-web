# 架构概览 —— Feature-Sliced Design + Next.js 15

## 1. 分层与依赖方向

```
┌────────────────────────────────────────────────────────┐
│  app/       Next.js App Router（layout / route / 装配）│
│     ↓                                                  │
│  widgets/   页面级组合（header/sidebar/complex sections）│
│     ↓                                                  │
│  features/  单一用户场景（auth-login、profile-edit）    │
│     ↓                                                  │
│  entities/  纯 TS 领域模型（不变量、值对象）            │
│     ↑                                                  │
│  shared/    ui 原子组件 / api 客户端 / lib / config     │
└────────────────────────────────────────────────────────┘
```

- 上层可引下层，反之 **FAIL**（dependency-cruiser + guard-ts-layer + entropy-check 三层强制）
- `shared/` 是公共基础，可被任何层依赖，但自身**不得反向依赖**业务层
- 同层 slice 之间**禁止直接 import**；跨 slice 复用下沉到 `entities/` 或 `shared/`

## 2. 目录骨架

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx
│   └── page.tsx
├── widgets/
│   └── header/
├── features/
│   └── auth-login/
│       ├── ui/
│       ├── model/                # hook / zustand store
│       ├── api/                  # 调用 shared/api 的用例
│       └── index.ts              # public API（唯一对外导出点）
├── entities/
│   └── user/
│       ├── model/
│       │   ├── user.ts
│       │   └── user.test.ts
│       ├── lib/
│       └── index.ts
└── shared/
    ├── api/                      # OpenAPI 生成 + fetch 封装
    │   ├── generated/
    │   └── client.ts
    ├── config/
    ├── lib/
    └── ui/                       # shadcn/ui 下沉点
```

## 3. 对象转换链

```
API Response ──(openapi-fetch + Zod)──→ DTO ──(mapper)──→ Entity ──(toViewModel)──→ UI Model
 shared/api/                           shared/api/       entities/                  features/|widgets/
```

## 4. 状态管理选型

| 状态类型 | 工具 | 位置 |
|---------|------|------|
| 服务器状态 | TanStack Query v5 | `features/*/api/` |
| 客户端跨组件状态 | Zustand | `features/*/model/store.ts` |
| 表单 | React Hook Form + Zod | `features/*/ui/*Form.tsx` |
| URL 状态 | Next.js searchParams | `app/` |
| 领域状态转换 | Entity 方法 | `entities/*/model/` |

组件内 `useState` 只管 UI-only 状态；业务状态必须归 entity 或 store。

## 5. 三层守护

| 层 | 工具 | 触发 |
|---|------|-----|
| L1 Hook | `guard-ts-layer.sh` | 每次 Edit/Write |
| L2 架构测试 | `dependency-cruiser` | `pnpm test` / CI |
| L3 熵扫描 | `entropy-check.sh`（13 项） | 交付前 / CI |

## 6. 后端对接

- OpenAPI schema：`http://localhost:8080/v3/api-docs`
- 生成：`pnpm run generate:api` → `src/shared/api/generated/`
- 封装：`src/shared/api/client.ts`（鉴权 / 错误映射 / retry）
- 禁止跨过 `shared/api/` 直接 `fetch(`（entropy-check 第 7 项）

## 7. 测试分层

见 `.claude/rules/ts-test.md`。
