# 测试用例设计 — {task-id}-{task-name}

## 测试范围
<!-- 一句话概括本次测试范围 -->


## 测试策略
按测试金字塔分层测试 + 代码审查 + 风格检查。

---

## 0. AC 自动化覆盖矩阵（强制，动笔前先填）

> **规则**：
> 1. 列出 `requirement-design.md#验收标准` 的每一条 AC
> 2. 每条必须映射到至少 1 个自动化测试（哪一层、哪个测试方法名）
> 3. 若标「手动」，必须说明**为什么不能自动化** + **替代自动化测试**（即便是弱化版）
> 4. @architect 评审时会校验本表是否填写完整，不全则 changes-requested

| # | 验收条件（AC） | 自动化层 | 对应测试方法 | 手动备注（若有） |
|---|---|---|---|---|
| AC1 | {例：登录成功后跳转首页} | features (RTL) | `useLogin.test.ts → should_redirect_to_home_when_login_success` | - |
| AC2 | {例：登录失败显示字段错误} | features (RTL) | `LoginForm.test.tsx → should_show_error_when_credentials_invalid` | - |
| AC3 | {例：完整用户注册→登录→访问受保护页} | E2E (Playwright) | `tests/e2e/auth.spec.ts → should_access_protected_page_after_register_and_login` | - |

**反模式（禁止）**：
- ❌ "请求错误无法自动化" → 错。用 MSW `server.use(rest.post(..., (req, res) => res.networkError()))` 可模拟
- ❌ "响应式只能手测" → 错。Playwright `viewport` 或 `preview_resize` 可自动化
- ❌ "加载态/空态只能肉眼看" → 错。MSW `delay(...)` + RTL `findBy*` / `queryBy*` 覆盖三态

---

## 一、entities 层测试场景

<!-- 纯单元测试，Vitest；禁 React / @testing-library / MSW / fetch import -->

### {ValueObject} 值对象
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| E1 | 合法值创建 | - | `{VO}.create(valid)` | 创建成功 + 字段只读 |
| E2 | 非法值 | - | `{VO}.create(invalid)` | 抛 Error（含 `code`） |
| E3 | 边界值 | - | {描述} | {预期} |
| E4 | 相等性 | - | 两个相同值 | `a.equals(b) === true` |
| E5 | 不可变 | - | `Object.isFrozen(vo)` | `true` |

### {Aggregate} 聚合根
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| E6 | 工厂创建 | - | `{Aggregate}.create(...)` | 初始状态正确 |
| E7 | 状态变更（不可变） | {前置状态} | `.{method}()` | 返回新实例，原实例不变 |
| E8 | 不变量约束 | {违反条件} | `.{method}()` | 抛 Error |

---

## 二、features 层测试场景（model / api）

<!-- Vitest + MSW；hook 测试使用 renderHook + QueryClientProvider 包裹 -->

### model（store / hook / mapper）
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| F1 | store 初始状态 | - | `useXxxStore.getState()` | `{ ... }` 默认值 |
| F2 | login 更新状态 | - | `store.login(dto)` | user 字段填充、token 已 setTokens |
| F3 | logout 重置状态 | 已登录 | `store.logout()` | 回到默认 + token cleared |

### api（useLogin / useRegister 等 mutation）
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| F4 | 登录成功 | MSW 返回 200 | `mutate({ account, password })` | onSuccess 触发 store.login |
| F5 | 登录失败 401 | MSW 返回 401 | `mutate(...)` | onError 触发，不 setTokens |
| F6 | 网络错误 | MSW networkError | `mutate(...)` | error 对象传给组件 |

---

## 三、features / widgets UI 测试场景

<!-- RTL + jsdom；用户视角查询（getByRole / getByLabelText），禁 querySelector 实现细节 -->

| # | 场景 | 操作 | 预期结果 |
|---|------|------|----------|
| U1 | 渲染表单 | render `<LoginForm />` | 能看到账号/密码 label + 提交按钮 |
| U2 | 字段校验失败 | 提交空表单 | 显示字段错误，提交按钮不发起请求 |
| U3 | 加载态 | 提交中 | 按钮禁用，显示 loading |
| U4 | 提交成功 | 填入有效值 → 点击提交 | 触发 mutation，onSuccess 回调 |

---

## 四、E2E 测试场景（Playwright，≤3 用例）

<!-- tests/e2e/**/*.spec.ts；覆盖核心用户流；禁止重复覆盖其他 slice -->

| # | 场景 | 操作 | 预期结果 |
|---|------|------|----------|
| P1 | 主流程 | {完整用户操作序列} | 页面跳转 + 数据呈现 |
| P2 | 关键异常分支 | {异常操作} | 错误提示 + 不破坏后续操作 |
| P3 | 跨刷新保持（如 auth 持久化） | 登录 → 刷新 | 仍登录态 |

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
