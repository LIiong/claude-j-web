# UI 开发规范（claude-j-web）

> 适用：所有 `handoff.ui-surface=true` 的前端任务。
> 配套：`docs/exec-plan/templates/ui-spec.template.md`、`.claude/agents/architect.md#UI 合规（6 项）`。

## 1. 组件库约定

### 1.1 单一来源
- **所有基础组件必须来自 `src/shared/ui/`**（shadcn/ui 初始化产出）
- 禁止在 `features/` / `widgets/` / `app/` 中裸写 `<button>` / `<input>` / `<select>` 等原生控件
- 新增 shadcn 组件时：
  1. `pnpm dlx shadcn@latest add <component>`
  2. 在 `requirement-design.md`「组件选型 - 本次新增」声明
  3. 产物应落到 `src/shared/ui/<component>.tsx`

### 1.2 FSD 分层归属
| 层 | 归属 | 示例 |
|----|------|------|
| `shared/ui/` | shadcn/ui 基础件、无业务语义 | `Button`, `Input`, `Dialog`, `Form` |
| `features/*/ui/` | 单一场景业务组件 | `LoginForm`, `RegisterForm` |
| `widgets/` | 跨场景页面级组合 | `AppHeader`, `Sidebar`, `UserMenu` |
| `app/*/page.tsx` | 仅做装配，不写业务 | 组合 `widgets/*` + `features/*` |

### 1.3 命名导出
- `features/` / `widgets/` / `entities/` 下**禁用** `export default`
- `shared/ui/` 下 shadcn 组件照搬官方模式（通常命名导出）
- 组件 props 类型必须导出：`export type XxxProps = { ... }`

## 2. 设计令牌（禁硬编码）

### 2.1 颜色
只允许通过 Tailwind 语义 token 引用：
- `primary` / `primary-foreground`
- `destructive` / `destructive-foreground`
- `muted` / `muted-foreground`
- `success` / `warning` / `info`（如定义）
- `background` / `foreground`

**禁止**：
```tsx
// ❌
<div className="bg-[#3b82f6]">
<div style={{ color: 'rgb(59,130,246)' }}>

// ✅
<div className="bg-primary text-primary-foreground">
```

### 2.2 间距 / 尺寸
- 仅用 Tailwind spacing scale（`p-4`, `gap-6`, `mt-8`）
- 禁止 `style={{ padding: '13px' }}` / `className="p-[17px]"` 这种任意值
- 例外：一次性像素修正（`top-[1px]` 调对齐）必须写注释说明原因

### 2.3 字号 / 圆角 / 阴影
- 字号：`text-xs` / `text-sm` / `text-base` / `text-lg` / `text-xl` / `text-2xl`
- 圆角：`rounded-sm` / `rounded-md` / `rounded-lg` / `rounded-full`
- 阴影：`shadow-sm` / `shadow` / `shadow-md` / `shadow-lg`

## 3. 响应式断点

统一使用 Tailwind 默认断点：

| 断点 | Tailwind 前缀 | 范围 | 典型用途 |
|------|---------------|------|----------|
| mobile | （默认） | <640px | 单列、栈式 |
| sm | `sm:` | ≥640px | 小屏横向 |
| md | `md:` | ≥768px | 平板 |
| lg | `lg:` | ≥1024px | 桌面 |
| xl | `xl:` | ≥1280px | 大屏桌面 |
| 2xl | `2xl:` | ≥1536px | 超大屏 |

**规则**：
- 每个可见页面至少覆盖 `mobile` / `tablet (md)` / `desktop (lg)` 三档
- 移动优先（mobile-first）：默认样式 = mobile，断点前缀只写"增强"
- UI-SPEC.md §7 必须列出每断点的布局差异

## 4. 可访问性（A11y）红线

四项必须 100% 满足（写进验收清单）：

### 4.1 表单标签
- 所有 `<input>` / `<select>` / `<textarea>` 必须有关联 `<label htmlFor>` 或 `aria-label`
- shadcn `<FormField>` 已内置，使用时勿破坏其结构

### 4.2 键盘可达
- Tab 顺序符合视觉顺序
- 交互元素 Enter / Space 可触发
- 弹层 Esc 可关闭
- 禁止 `onClick` 挂在 `<div>` 上；用 `<button>`

### 4.3 对比度
- 正文文本 ≥ WCAG AA 4.5:1
- UI 元素（按钮边框、图标）≥ 3:1
- 设计令牌（`foreground` / `background` 对）应预先满足；自定义颜色须用工具验证

### 4.4 三态覆盖
每个数据呈现组件必须明确 loading / empty / error 视觉：
- **Loading**：skeleton / spinner / 按钮 `loading` 态
- **Empty**：占位插图 + 引导文案
- **Error**：Boundary 捕获 + "重试"操作

### 4.5 焦点可见
- 不得 `outline-none` 而不提供替代焦点样式
- 统一使用 `:focus-visible` + Tailwind `focus-visible:ring-*`

## 5. 状态与数据流

- 服务端状态走 **TanStack Query**（`features/*/api/use*.ts`），不在组件里 `useEffect + fetch`
- 客户端持久状态走 **Zustand**（`features/*/model/store.ts`），**store 禁存 class 实例**（持久化会失效，存 plain object/DTO）
- 表单状态走 **React Hook Form + Zod resolver**
- 跨 slice 通信：URL / 事件 / 共享 entity，**禁 `features/a` 直接 import `features/b`**

## 6. 测试约定

| 层 | 工具 | 关注点 |
|----|------|--------|
| `shared/ui/*` | Vitest + @testing-library/react | 组件可点、a11y role 存在 |
| `features/*/ui` | Vitest + @testing-library/react + MSW | 表单提交、错误态、loading 态 |
| `widgets/*` | 同上 | 组合行为 |
| 关键用户流 | Playwright | 登录/注册/核心交易 3 条以内 |

测试命名：`should_{预期}_when_{条件}`，全小写下划线，禁用 camelCase（entropy-check 规则 #9）。

## 7. 不做的事（反模式）

- ❌ 在 `entities/` 引入 React / Tailwind 类名
- ❌ 业务组件里直接调 `fetch`（只走 `shared/api`）
- ❌ 用 `dangerouslySetInnerHTML` 插入非受信内容
- ❌ 复制 shadcn 组件到 `features/` 并改内部（应就地扩展 `shared/ui/` 或 compose）
- ❌ 单任务新增 >3 个 Playwright 用例
- ❌ 把原生 HTML 属性当 props 透传（显式声明需要的 props）

## 8. 与 Spec / Verify 的对接

- Spec 阶段：@dev 按本文档 + `ui-spec.template.md` 产 `UI-SPEC.md`
- Review 阶段：@architect 按 `.claude/agents/architect.md#UI 合规（6 项）` 校验
- Verify 阶段：@qa 按 `.claude/agents/qa.md#4.1 UI 验收` 跑 Preview MCP + `gsd:ui-review` 打分
- 任一环节违反本文档 → `status: changes-requested`
