# 需求拆分设计 — 001-auth-login

## 需求描述

实现用户登录和注册功能的前端页面，对接后端 `/api/v1/auth` 接口。支持邮箱/密码登录、新用户注册、Token 持久化和自动续期。

## 领域分析

### 实体: User

用户实体封装用户核心信息与身份验证状态。

- **id** (`UserId`) — 用户唯一标识符（UUID）
- **email** (`Email`) — 用户邮箱，唯一标识
- **nickname** (`string`) — 用户昵称
- **status** (`UserStatus`) — 用户状态：ACTIVE | INACTIVE | SUSPENDED
- **createdAt** (`Date`) — 注册时间
- **updatedAt** (`Date`) — 最后更新时间

**方法**:
- `isActive(): boolean` — 检查用户是否处于活跃状态
- `updateNickname(nickname: string): User` — 返回更新昵称后的新用户对象（不可变）

### 值对象

#### Email
- **约束**: 符合 RFC 5322 邮箱格式，不可变
- **校验**: 非空，格式正则 `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- **方法**: `equals(other: Email): boolean`

#### Password (纯前端值对象，用于表单校验)
- **约束**: 8-32 字符，必须包含大小写字母、数字
- **校验**: 非空，长度，字符复杂度
- **说明**: 明文密码不会作为值对象持久化，仅用于表单层校验

#### AccessToken
- **约束**: JWT 字符串，不可变
- **属性**: `token: string`, `expiresAt: Date`, `tokenType: 'Bearer'`
- **方法**: `isExpired(): boolean`, `isValid(): boolean`

#### UserId
- **约束**: UUID v4 格式字符串，不可变
- **校验**: 非空，UUID 格式

#### UserStatus (枚举)
- `ACTIVE` — 正常活跃状态
- `INACTIVE` — 未激活（需邮箱验证）
- `SUSPENDED` — 已封禁

### 领域服务

本任务业务逻辑简单，User 实体方法已足够覆盖，无需额外领域服务。

### 端口接口

#### AuthApiClient (位于 shared/api/)
后端 OpenAPI 生成的 API 客户端封装接口：

- `login(credentials: LoginCredentialsDTO): Promise<AuthResponseDTO>` — 用户登录
- `register(data: RegisterDTO): Promise<AuthResponseDTO>` — 用户注册
- `refreshToken(refreshToken: string): Promise<AuthResponseDTO>` — Token 续期

## 关键算法/技术方案

### Token 管理策略
- **存储位置**: `localStorage` (AccessToken) + `localStorage` (RefreshToken)
- **自动续期**: 在 `shared/api/client.ts` 拦截器中检测 401 响应，自动调用 refresh 接口
- **安全考虑**: Token 仅通过 HttpOnly cookie 作为备选方案，当前采用 localStorage + XSS 防护

### 状态管理
- **服务器状态**: TanStack Query v5 管理登录/注册 mutation
- **客户端状态**: Zustand 存储当前登录用户 + Token
- **持久化**: zustand-persist 插件持久化用户基础信息

### 表单处理
- **库**: React Hook Form + Zod resolver
- **校验**: Zod schema 同步校验（邮箱格式、密码强度）
- **UX**: 实时校验 + 提交时校验结合

## API 设计

### 后端接口契约 (基于 /api/v1/auth)

| 方法 | 路径 | 描述 | 请求体 | 响应体 |
|------|------|------|--------|--------|
| POST | /api/v1/auth/login | 用户登录 | `{ "email": "string", "password": "string" }` | `{ "success": true, "data": { "accessToken": "string", "refreshToken": "string", "expiresIn": 3600, "user": {...} } }` |
| POST | /api/v1/auth/register | 用户注册 | `{ "email": "string", "password": "string", "nickname": "string" }` | 同上 |
| POST | /api/v1/auth/refresh | Token 续期 | `{ "refreshToken": "string" }` | 同上 |
| POST | /api/v1/auth/logout | 用户登出 | — | `{ "success": true }` |

### 前端 DTO (Zod Schema)

```typescript
// shared/api/dto/auth.ts
export const LoginCredentialsSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少8位').max(32, '密码最多32位'),
});

export const RegisterSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少8位').regex(/[A-Z]/, '需包含大写字母').regex(/[a-z]/, '需包含小写字母').regex(/\d/, '需包含数字'),
  nickname: z.string().min(2, '昵称至少2位').max(20, '昵称最多20位'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

export const AuthResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    user: UserSchema,
  }),
});
```

## UI 设计

### 页面结构

```
app/
├── login/
│   └── page.tsx          # 登录页面
├── register/
│   └── page.tsx          # 注册页面
└── layout.tsx            # 根布局（含全局 Provider）

features/
└── auth/
    ├── ui/
    │   ├── LoginForm.tsx      # 登录表单组件
    │   ├── RegisterForm.tsx   # 注册表单组件
    │   └── AuthGuard.tsx      # 权限守卫组件
    ├── model/
    │   ├── store.ts           # Zustand auth store
    │   └── useAuth.ts         # auth 相关 hooks
    ├── api/
    │   ├── useLogin.ts        # login mutation hook
    │   ├── useRegister.ts     # register mutation hook
    │   └── useLogout.ts       # logout mutation hook
    └── index.ts               # public API

entities/
└── user/
    ├── model/
    │   ├── user.ts            # User 实体
    │   ├── user.test.ts       # 实体测试
    │   ├── email.ts           # Email 值对象
    │   ├── email.test.ts      # 值对象测试
    │   ├── accessToken.ts     # AccessToken 值对象
    │   └── accessToken.test.ts
    └── index.ts
```

### 表单字段与校验规则

**登录表单**:
| 字段 | 类型 | 必填 | 校验规则 | 错误提示 |
|------|------|------|----------|----------|
| email | email | 是 | RFC 5322 格式 | "请输入有效的邮箱地址" |
| password | password | 是 | 8-32 字符 | "密码至少8位，最多32位" |

**注册表单**:
| 字段 | 类型 | 必填 | 校验规则 | 错误提示 |
|------|------|------|----------|----------|
| email | email | 是 | RFC 5322 格式 | "请输入有效的邮箱地址" |
| password | password | 是 | 8-32 字符，含大小写+数字 | 实时提示具体要求 |
| confirmPassword | password | 是 | 与 password 一致 | "两次输入的密码不一致" |
| nickname | text | 是 | 2-20 字符 | "昵称2-20个字符" |

## 验收条件

1. **功能验收**
   - [ ] 用户可通过邮箱+密码正常登录
   - [ ] 新用户可完成注册流程
   - [ ] Token 自动续期机制正常工作
   - [ ] 登录状态持久化（刷新页面后保持登录）
   - [ ] 登出功能清除 Token 并跳转登录页

2. **校验验收**
   - [ ] 邮箱格式校验实时反馈
   - [ ] 密码强度校验（8位+大小写+数字）
   - [ ] 注册时确认密码一致性校验
   - [ ] 后端返回错误信息正确展示

3. **性能验收**
   - [ ] 登录 API 响应 < 1s
   - [ ] 页面首屏加载 < 2s

4. **可测试性**
   - [ ] User 实体单元测试覆盖率 100%
   - [ ] Email/AccessToken 值对象测试覆盖率 100%
   - [ ] Login/Register Feature 测试覆盖 happy path + 异常分支
   - [ ] Login/Register 页面 RTL 测试覆盖表单交互

## 影响范围

- **entities/**: 新增 `user/` slice — User 实体、Email/AccessToken/UserId 值对象
- **features/**: 新增 `auth/` slice — LoginForm/RegisterForm 组件、auth store、登录/注册 mutations
- **shared/api/**: 新增 `dto/auth.ts` DTO schemas、`client.ts` 鉴权拦截器增强
- **app/**: 新增 `/login`、`/register` 路由页面
- **widgets/**: 暂无（后续可添加 Header 组件显示用户信息）

---

## 架构评审

**评审人**: @architect
**日期**: 2026-04-19
**结论**: 通过

### 评审检查项（9 维）

**架构合规（5 项）**
- [x] 聚合边界清晰: User 作为聚合根封装 id/email/nickname/status，值对象识别充分
- [x] 值对象不可变: Email/AccessToken/UserId 均设计为 readonly + 工厂方法创建
- [x] 依赖方向正确: entities → shared/api DTO → features model/store → features ui → app，符合 FSD 自上而下
- [x] 端口定义合理: AuthApiClient 位于 shared/api/，login/register/refresh 方法粒度适中
- [x] 状态管理方案合适: TanStack Query 管服务器状态 + Zustand 管客户端状态 + persist 持久化，分层清晰

**API/测试（2 项）**
- [x] API 契约完整: 覆盖 login/register/refresh/logout，Zod schema 定义完备，含密码一致性校验 refine
- [x] 测试策略覆盖: entities 层纯 Vitest 测不变量，features 层 Vitest+MSW 测 mutation，UI 层 RTL 测交互，符合分层测试策略

**设计质量（2 项）**
- [x] 无过度设计: 无单一实现的 Strategy/Factory，领域服务明确说明"无需额外"
- [x] 符合 Karpathy 简洁原则: 任务计划按 entities→shared→features→app 分层拆解，每项 10-15 分钟，验证命令+预期输出明确

### 评审意见

设计整体合规，符合 FSD 架构要求：

1. **entities/ 纯净性**: User 实体仅依赖 TypeScript 原生，无 React/Next 依赖，符合纯净要求
2. **转换链完整**: API Response → Zod DTO → Entity → UI Model 的转换路径清晰，LoginCredentialsSchema/RegisterSchema/AuthResponseSchema 定义在 shared/api/
3. **状态分层合理**: 服务器状态(TanStack Query)与客户端状态(Zustand)分离，Token 存储策略已在「待确认事项」显式声明
4. **任务粒度合规**: 16 项任务按层拆解，每个原子任务含文件路径+验证命令+预期输出+commit 消息，符合模板要求

**待确认事项**（已在 handoff.md 列出，开发时关注）：
- 后端 `/api/v1/auth` 接口字段格式需对接真实 OpenAPI schema
- Token 存储策略 localStorage vs HttpOnly cookie 需最终确认

**基线检查**: entropy-check.sh 13/13 项通过

### 通过条件

- [x] 架构合规检查: PASS
- [x] 熵扫描基线: PASS (13/13)
- [x] 任务计划粒度: 合格 (10-15分钟/步，含验证命令)
- [x] 无循环依赖风险: 确认 (新聚合仅依赖 shared/api，无反向依赖)

**评审结论**: 设计通过，可以进入 Build 阶段。
