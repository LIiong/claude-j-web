# 需求拆分设计 — {task-id}-{task-name}

## 需求描述
<!-- 用 1-3 句话概括本次需求的核心目标 -->


## UI 原型
<!--
  仅当 handoff.md 的 ui-surface=true 时填写；ui-surface=false（后端-only 任务）直接写：
  > N/A (backend-only)
  详细原型/交互/组件清单由 `gsd:ui-phase` skill 产出 `UI-SPEC.md`，本章节只做契约摘要与索引。
-->

### 线框图
<!-- 链接到同目录 UI-SPEC.md，或附低保真截图；每个关键页面一条 -->
- 详见 [UI-SPEC.md](./UI-SPEC.md)

### 关键页面 / 视图
| 路由 | 页面名 | 所属 FSD 层 | 备注 |
|------|--------|-------------|------|
| `/xxx` | XxxPage | `app/xxx` | 装配 `widgets/*` + `features/*` |

### 交互流（主流程 + 异常分支）
1. **主流程**：用户 … → 点击 … → 跳转 …
2. **异常分支**：
   - 表单校验失败 → 字段级错误提示
   - 网络/后端 401 → 跳登录
   - 后端业务错误 → toast 显示 `AuthResponse.message`

### 组件选型
- **复用 `src/shared/ui/`（shadcn/ui）**：Button / Input / Form / Dialog / …
- **本次新增**：{无 / 列出新增 shadcn 组件 + 引入理由}
- **严禁**：裸 `<button>` / 原生 `<input>` / 硬编码样式（颜色、间距、字号）

### 设计令牌引用
- 颜色：`primary` / `destructive` / `muted` …（见 `tailwind.config.ts` 语义 token）
- 间距：仅用 Tailwind spacing scale（`p-4`, `gap-6`），禁 `style={{ padding: '13px' }}`
- 字号 / 圆角 / 阴影：同上，引用语义 token

### 响应式断点
| 断点 | 范围 | 布局调整 |
|------|------|---------|
| mobile | <640px | 单列、栈式 |
| tablet | 640–1024px | — |
| desktop | ≥1024px | — |

### 可访问性（四项红线，逐条勾选）
- [ ] 所有表单控件有可感知 `<label>`（htmlFor / aria-label）
- [ ] 键盘可达：Tab 顺序合理，Enter 可提交，Esc 可关闭弹层
- [ ] 对比度达 WCAG AA（≥4.5:1 文本 / ≥3:1 UI 元素）
- [ ] 三态具备：loading / empty / error 都有明确视觉反馈


## 领域分析

### 聚合根: {AggregateName}
<!-- 列出聚合根的核心属性和值对象 -->
- field1 (ValueObject1) — 说明
- field2 (ValueObject2) — 说明

### 值对象
<!-- 每个值对象单独列出，说明约束条件 -->
- **{ValueObject1}**: 约束说明，不可变
- **{ValueObject2}**: 约束说明，不可变

### 领域服务（如有）
<!-- 无法归属到单一聚合的业务逻辑 -->

### 端口接口
<!-- Repository 和其他需要 infrastructure 实现的接口 -->
- **{Aggregate}Repository**: 方法列表
- **{DomainService}**: 方法列表

## 关键算法/技术方案
<!-- 核心算法设计、技术选型理由、性能考量 -->


## API 设计

| 方法 | 路径 | 描述 | 请求体 | 响应体 |
|------|------|------|--------|--------|
| POST | /api/v1/xxx | 创建 | `{ "field": "value" }` | `{ "success": true, "data": {...} }` |
| GET | /api/v1/xxx/{id} | 查询 | — | `{ "success": true, "data": {...} }` |

## 数据库设计（如有）
<!-- DDL、索引策略、数据量预估 -->
```sql
CREATE TABLE IF NOT EXISTS t_xxx (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    -- 字段定义
);
```

## 影响范围
<!-- 按 DDD 分层列出新增/修改的类 -->
- **domain**:
- **application**:
- **infrastructure**:
- **adapter**:
- **start**:
