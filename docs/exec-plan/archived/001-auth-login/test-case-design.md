# 测试用例设计 — 001-auth-login

## 测试范围
用户登录注册功能前端实现，覆盖 entities 层值对象/聚合根、features 层状态管理/mutation hooks、UI 层表单组件、App 层页面集成。

## 测试策略
按测试金字塔分层测试：entities 纯单元测试 → features 层测试（store + mutation hooks）→ UI 层组件测试 → E2E 集成测试。代码审查覆盖 FSD 架构合规性，风格检查覆盖 Biome 规则。

---

## 0. AC 自动化覆盖矩阵

| # | 验收条件（AC） | 自动化层 | 对应测试方法 | 手动备注 |
|---|---|---|---|---|
| AC1 | 用户可通过邮箱+密码正常登录 | Features | `useLogin` hook 测试 + LoginForm 交互测试 | - |
| AC2 | 新用户可完成注册流程 | Features | `useRegister` hook 测试 + RegisterForm 交互测试 | - |
| AC3 | Token 自动续期机制正常工作 | Shared/API | `apiFetch` 401 处理逻辑（TODO 标记） | - |
| AC4 | 登录状态持久化（刷新页面后保持登录） | Features | `AuthStore` persist 测试（zustand-persist 行为） | - |
| AC5 | 登出功能清除 Token 并跳转登录页 | Features | `useLogout` hook 测试 | - |
| AC6 | 邮箱格式校验实时反馈 | Entities/Features | `Email.create` 测试 + Zod schema 校验测试 | - |
| AC7 | 密码强度校验（8位+大小写+数字） | Features | `RegisterFormSchema` refine 测试 | - |
| AC8 | 注册时确认密码一致性校验 | Features | `RegisterFormSchema.refine` 测试 | - |
| AC9 | 后端返回错误信息正确展示 | Features | `LoginForm`/`RegisterForm` error 状态渲染测试 | - |
| AC10 | 登录 API 响应 < 1s | E2E | Playwright 性能测试（可选，需后端联调） | 需真实后端，暂标 E2E |
| AC11 | 页面首屏加载 < 2s | E2E | Playwright 性能测试 | 需真实后端，暂标 E2E |
| AC12 | User 实体单元测试覆盖率 100% | Entities | `user.test.ts` (6 tests) | - |
| AC13 | Email/AccessToken 值对象测试覆盖率 100% | Entities | `email.test.ts` (5 tests) + `accessToken.test.ts` (8 tests) | - |
| AC14 | Login/Register Feature 测试覆盖 happy path + 异常分支 | Features | `store.test.ts` (4 tests) + hooks 测试 | - |
| AC15 | Login/Register 页面 RTL 测试覆盖表单交互 | UI/Widgets | `LoginForm.test.tsx` + `RegisterForm.test.tsx` | - |

---

## 一、Entities 层测试场景（Vitest 纯单元测试）

### Email 值对象
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| E-D1 | 合法邮箱创建 | - | `Email.create('user@example.com')` | 创建成功，value 为 lowercase |
| E-D2 | 非法邮箱格式 | - | `Email.create('invalid')` | throw 'Invalid email format' |
| E-D3 | 空字符串邮箱 | - | `Email.create('')` | throw 'Invalid email format' |
| E-D4 | 相等性（相同值） | - | `e1.equals(e2)` 同值 | `true` |
| E-D5 | 相等性（不同值） | - | `e1.equals(e2)` 不同值 | `false` |

### UserId 值对象
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| E-D6 | 合法 UUID 创建 | - | `UserId.create('550e8400-e29b-41d4-a716-446655440000')` | 创建成功 |
| E-D7 | 非法 UUID 格式 | - | `UserId.create('invalid-uuid')` | throw 'Invalid UUID format' |
| E-D8 | 空字符串 | - | `UserId.create('')` | throw 'Invalid UUID format' |
| E-D9 | generate() 生成唯一值 | - | 两次调用 `UserId.generate()` | 值不相等，符合 UUID v4 格式 |
| E-D10 | 相等性（相同值） | - | `id1.equals(id2)` 同值 | `true` |
| E-D11 | 相等性（不同值） | - | `id1.equals(id2)` 不同值 | `false` |

### AccessToken 值对象
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| E-D12 | 合法 token 创建 | 未来过期时间 | `AccessToken.create('jwt', futureDate, 'Bearer')` | 创建成功 |
| E-D13 | 空 token 拒绝 | - | `AccessToken.create('', futureDate)` | throw 'Token cannot be empty' |
| E-D14 | 已过期检查 | 过去时间 | `token.isExpired()` | `true` |
| E-D15 | 未过期检查 | 未来时间 | `token.isExpired()` | `false` |
| E-D16 | isValid 综合检查 | 未来时间 | `token.isValid()` | `true` |
| E-D17 | isValid（已过期） | 过去时间 | `token.isValid()` | `false` |
| E-D18 | 默认 Bearer type | - | `AccessToken.create('jwt', futureDate)` | `tokenType` 为 'Bearer' |
| E-D19 | Authorization Header | - | `token.getAuthorizationHeader()` | `'Bearer jwt'` |

### User 聚合根
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| E-D20 | 创建 User | 有效 props | `User.create(props)` | 创建成功，所有字段匹配 |
| E-D21 | 缺失 id | id 为空 | `User.create({...})` | throw 'User.id is required' |
| E-D22 | 缺失 email | email 为空 | `User.create({...})` | throw 'User.email is required' |
| E-D23 | 缺失 nickname | nickname 为空 | `User.create({...})` | throw 'User.nickname is required' |
| E-D24 | 缺失 status | status 为空 | `User.create({...})` | throw 'User.status is required' |
| E-D25 | 缺失时间戳 | createdAt/updatedAt 为空 | `User.create({...})` | throw 时间戳必填错误 |
| E-D26 | ACTIVE 状态检查 | status='ACTIVE' | `user.isActive()` | `true` |
| E-D27 | INACTIVE 状态检查 | status='INACTIVE' | `user.isActive()` | `false` |
| E-D28 | SUSPENDED 状态检查 | status='SUSPENDED' | `user.isActive()` | `false` |
| E-D29 | updateNickname 不可变 | 原 nickname='Old' | `user.updateNickname('New')` | 返回新 User，原对象不变 |
| E-D30 | updateNickname 空值校验 | nickname='' | `user.updateNickname('')` | throw 'Nickname cannot be empty' |
| E-D31 | 对象冻结 | - | `Object.isFrozen(user)` | `true` |

---

## 二、Features 层测试场景（Vitest + MSW）

### AuthStore (Zustand)
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| F-A1 | 初始状态未认证 | - | `store.getState()` | `isAuthenticated=false`, `session=null` |
| F-A2 | login 设置会话 | mock TokenDataDTO | `store.getState().login(data)` | `isAuthenticated=true`, session 数据匹配 |
| F-A3 | logout 清除会话 | 已登录状态 | `store.getState().logout()` | `isAuthenticated=false`, `session=null` |
| F-A4 | session 可 JSON 序列化 | - | `JSON.parse(JSON.stringify(session))` | 与原 session 相等 |

### useLogin Mutation Hook
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| F-A5 | 登录成功 mutation | MSW 返回 200 + success=true | `mutate(credentials)` | `isSuccess=true`, store 更新为已登录 |
| F-A6 | 登录失败 mutation | MSW 返回 401 | `mutate(credentials)` | `isError=true`, error 对象存在 |
| F-A7 | 登录成功自动设置 token | MSW 返回 token 数据 | `mutate(credentials)` | `setTokens` 被调用（需验证） |

### useRegister Mutation Hook
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| F-A8 | 注册成功 mutation | MSW 返回 200 + success=true | `mutate(formData)` | `isSuccess=true`, 自动调用 login |
| F-A9 | 注册失败 mutation | MSW 返回 400 | `mutate(formData)` | `isError=true` |
| F-A10 | confirmPassword 被过滤 | - | API 调用 payload | 不含 confirmPassword 字段 |

### useLogout Mutation Hook
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| F-A11 | 登出调用 API | 有 session | `mutate()` | 调用 `/api/v1/auth/logout` |
| F-A12 | 登出清除状态 | 任何结果 | `mutate()` | store logout 被调用 |

---

## 三、UI 层测试场景（Vitest + React Testing Library）

### LoginForm 组件
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| UI-W1 | 渲染表单元素 | - | render | 显示账号输入框、密码输入框、记住我复选框、登录按钮 |
| UI-W2 | 空值提交校验 | - | submit 空表单 | 显示账号必填错误 |
| UI-W3 | 密码长度校验 | - | 输入短密码提交 | 显示密码长度错误 |
| UI-W4 | 提交调用 onSubmit | - | 填写有效值提交 | `onSubmit` 被调用，参数含 account/password/rememberMe |
| UI-W5 | loading 状态禁用 | `isLoading=true` | - | 提交按钮禁用，显示"登录中..." |
| UI-W6 | 错误信息显示 | `error='网络错误'` | render | 显示错误信息文本 |

### RegisterForm 组件
| # | 场景 | 前置条件 | 操作 | 预期结果 |
|---|------|----------|------|----------|
| UI-W7 | 渲染表单元素 | - | render | 显示用户名、邮箱、密码、确认密码输入框 |
| UI-W8 | 用户名长度校验 | - | 输入1字符提交 | 显示"用户名至少2位" |
| UI-W9 | 邮箱格式校验 | - | 输入无效邮箱 | 显示邮箱格式错误 |
| UI-W10 | 密码复杂度校验 | - | 输入简单密码 | 显示需含大小写+数字错误 |
| UI-W11 | 确认密码一致性 | 密码='Pass1234' | 确认密码='Different' | 显示"两次输入的密码不一致" |
| UI-W12 | 成功提交 | 所有字段有效 | submit | `onSubmit` 被调用，含所有字段 |

---

## 四、E2E 测试场景（Playwright）

| # | 场景 | 操作 | 预期结果 |
|---|------|------|----------|
| E2E-E1 | 登录 → 首页跳转 | 访问 /login → 填写凭证 → 提交 | 跳转首页，localStorage 含 token |
| E2E-E2 | 注册 → 自动登录 | 访问 /register → 填写信息 → 提交 | 跳转首页，已登录状态 |
| E2E-E3 | 登录页 → 注册页链接 | 点击"立即注册"链接 | 跳转 /register |
| E2E-E4 | 注册页 → 登录页链接 | 点击"立即登录"链接 | 跳转 /login |

---

## 五、代码审查检查项

- [x] entities/ 纯净性（无 React/Next/Zustand/TanStack import）
- [x] FSD 依赖方向正确（app → widgets → features → entities ← shared）
- [x] 值对象不可变（readonly 字段 + 工厂方法）
- [x] 值对象 equals() 方法正确实现
- [x] 聚合根封装业务不变量（User.isActive(), updateNickname()）
- [x] 转换链完整（API Response ↔ DTO ↔ Entity ↔ UI Model）
- [x] features/ 层 export 命名导出
- [x] entities/ 层 export 命名导出
- [x] shared/api/ 是唯一定义 fetch 的位置
- [x] 无跨 slice 直接 import

## 六、代码风格检查项

- [x] TS strict: true 通过
- [x] noUncheckedIndexedAccess: true
- [x] 无裸 @ts-ignore（使用 @ts-expect-error）
- [x] 无 any 类型（生产代码）
- [x] entities/features 使用命名导出
- [x] 测试命名 should_xxx_when_yyy
- [x] Biome check 通过
- [x] FSD 目录结构合规

