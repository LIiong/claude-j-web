# UI 验收报告 — {task-id}-{task-name}

> 仅当 `handoff.md` 的 `ui-surface=true` 时由 @qa 产出。
> 附件目录约定：
> - 截图：`./screenshots/{route-slug}-{breakpoint}.png`
> - 交互流 GIF：`./flows/{flow-name}.gif`

**验收人**：@qa
**日期**：{YYYY-MM-DD}
**结论**：✅ 通过 / ❌ 待修复

---

## 1. 环境
- 本地：`pnpm dev` at `http://localhost:3000`
- 预览 MCP：`mcp__Claude_Preview__preview_start`
- 后端：`{base-url}`（或 mock/MSW）

## 2. 页面截图（每页 × 3 断点）

### 2.1 `/xxx` Page

| 断点 | 截图 | 备注 |
|------|------|------|
| mobile (375px) | ![mobile](./screenshots/xxx-mobile.png) | — |
| tablet (768px) | ![tablet](./screenshots/xxx-tablet.png) | — |
| desktop (1440px) | ![desktop](./screenshots/xxx-desktop.png) | — |

## 3. 交互流录制
| 流程 | GIF | 控制台断言（无 error） |
|------|-----|----------------------|
| 登录主流程（成功） | ![login-ok](./flows/login-ok.gif) | ✅ |
| 登录失败（字段校验） | ![login-fail](./flows/login-fail.gif) | ✅ |

## 4. gsd:ui-review 6 维评分

> 调用 `gsd:ui-review` skill 对每个关键页面打分；任一维度 <3/5 → `status: changes-requested` 打回 @dev。

| 页面 | 视觉层级 | 一致性 | 可读性 | 交互反馈 | 响应式 | A11y | 均分 |
|------|---------|--------|--------|---------|--------|------|------|
| `/xxx` | 4/5 | 4/5 | 5/5 | 4/5 | 4/5 | 4/5 | 4.2/5 |

**综合评分**：`{x.x}/5` （同步填入 `handoff.ui-review-score`）

### 打分证据链接
- 视觉层级：{截图 / 说明}
- 一致性：{组件是否全来自 shared/ui；命名/间距是否统一}
- 可读性：{文案、字号、对比度}
- 交互反馈：{loading/success/error 三态覆盖}
- 响应式：{3 断点截图一致性}
- A11y：{键盘可达、aria 标签、焦点可见}

## 5. 问题清单
| 严重度 | 问题 | 建议修复方案 |
|--------|------|-------------|
| Critical | — | — |
| Major | — | — |
| Minor | — | — |

## 6. 验收结论
- 全量 6 维评分 ≥3/5 且 Critical/Major = 0 → 标 `approved`
- 任一 <3/5 或 存在 Critical/Major → `changes-requested`，@dev 修复后重走 Verify

## 7. 附件清单
- `screenshots/`：N 张 PNG
- `flows/`：M 个 GIF
- 本文件 `ui-verification-report.md`
