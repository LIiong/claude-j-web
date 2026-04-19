# UI-SPEC — {task-id}-{task-name}

> 本文件承接 `gsd:ui-phase` skill 产出的 UI 设计契约。
> 当 `handoff.md` 的 `ui-surface=true` 时**必需**；`ui-surface=false` 时不需要。
> `requirement-design.md` 的「UI 原型」章节只写契约摘要并索引此文件。

## 1. 范围与目标
- **本次任务产生的可见 UI**：{一两句话说清楚"用户能在屏幕上看到/做什么"}
- **不在范围**：{列出明确不做的变更，避免隐式扩容}

## 2. 页面 / 视图清单
| 路由 | 页面名 | 关键组件 | FSD 层 |
|------|--------|---------|--------|
| `/xxx` | XxxPage | `LoginForm`, `Button`, … | `app/xxx` 装配 `features/*` |

## 3. 线框图 / 视觉稿
<!-- 低保真即可。可以粘贴 ASCII、Figma 链接、Excalidraw 导出 PNG 路径，或手绘照片 -->

### 3.1 桌面端（≥1024px）
```
┌─────────────────────────────────────┐
│  [Header]                           │
├─────────────────────────────────────┤
│                                     │
│    [Form: email]                    │
│    [Form: password]                 │
│    [Button: Login]                  │
│                                     │
└─────────────────────────────────────┘
```

### 3.2 平板（640–1024px）
{必要时附差异；否则写"同桌面端"}

### 3.3 移动端（<640px）
{单列、栈式}

## 4. 交互流

### 4.1 主流程
1. 用户访问 `/xxx`
2. 填入 … → 点击 "提交"
3. 成功：跳转 `/success`，显示 toast "OK"
4. 失败：字段级错误 / 全局错误 toast

### 4.2 异常分支
- 表单校验失败 → 显示字段错误、禁用提交按钮
- 网络错误（HTTP 非 2xx）→ Toast `message`
- 401 未授权 → 跳 `/login`
- 409 业务冲突 → 表单下方 Alert 显示 `errorCode` + `message`

### 4.3 加载 / 空 / 错误三态
- **Loading**：按钮 `loading` prop 显示 spinner
- **Empty**：列表为空时显示占位插图 + 引导语
- **Error**：Boundary 捕获，显示"重试"按钮

## 5. 组件选型
- **复用 `src/shared/ui/`（shadcn/ui）**：Button / Input / Form / Label / Dialog / Toast / Card
- **本次新增**：{无 / 列新增 shadcn 组件 + 引入理由，如"首次引入 `command` 做快捷搜索"}
- **业务组合（`features/*/ui` 或 `widgets/*`）**：`LoginForm`, `XxxPanel`

## 6. 设计令牌
- **颜色**：`primary`（主按钮）/ `destructive`（删除/错误）/ `muted`（次级文本）/ `success`（提示）
- **间距**：`gap-2` / `gap-4` / `p-6` 等 Tailwind spacing scale
- **圆角**：`rounded-md`（表单）/ `rounded-lg`（卡片）
- **字号**：`text-sm`（辅助）/ `text-base`（正文）/ `text-xl`（标题）
- **禁止**：硬编码 `#ffffff` / `13px` / `rgb(...)`；统一走 `tailwind.config.ts` 语义 token

## 7. 响应式断点
| 断点 | Tailwind 前缀 | 范围 | 关键差异 |
|------|---------------|------|----------|
| mobile | （默认） | <640px | 单列栈式 |
| tablet | `sm:` / `md:` | 640–1024px | 双列？ |
| desktop | `lg:` | ≥1024px | 侧栏？ |

## 8. 可访问性 (A11y)
- [ ] 所有控件有 `<label htmlFor>` 或 `aria-label`
- [ ] 键盘：Tab 顺序可控；Enter 提交；Esc 关弹层
- [ ] 焦点：`:focus-visible` 可见
- [ ] 对比度：文本 ≥4.5:1，UI 元素 ≥3:1（见 WCAG AA）
- [ ] 语义 HTML：使用 `<button>` 不用 `<div onClick>`；`<main>`/`<nav>`/`<section>` 正确嵌套
- [ ] 状态变化对屏幕阅读器可感知（`aria-live` / `role="status"`）

## 9. 测试映射（对接 test-case-design.md）
| 交互流 | 自动化测试方法 | 文件 |
|--------|---------------|------|
| 登录主流程（成功） | `should_redirect_to_home_when_login_success` | `tests/e2e/login.spec.ts` |
| 表单校验失败 | `should_show_field_error_when_invalid_email` | `src/features/auth/ui/LoginForm.test.tsx` |
| 401 跳登录 | `should_redirect_to_login_when_401_received` | `src/shared/api/client.test.ts` |
