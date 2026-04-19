# 任务执行计划 — 001-auth-login

## 任务状态跟踪

<!-- 状态流转：待办 → 进行中 → 单测通过 → 待验收 → 验收通过 / 待修复 -->

| # | 任务 | 负责人 | 状态 | 备注 |
|---|------|--------|------|------|
| 1 | Entity: User + 值对象 + 测试 | dev | 单测通过 | Email, AccessToken, UserId (25 tests) |
| 2 | Entity: 值对象相等性/校验测试 | dev | 单测通过 | 覆盖边界场景 |
| 3 | Shared: Auth DTO schemas (Zod) | dev | 单测通过 | Login/Register/AuthResponse |
| 4 | Shared: API client 鉴权拦截器 | dev | 单测通过 | Token 管理 |
| 5 | Feature: Auth Store (Zustand) | dev | 单测通过 | 登录状态管理 (4 tests) |
| 6 | Feature: Login mutation hook | dev | 单测通过 | TanStack Query |
| 7 | Feature: Register mutation hook | dev | 单测通过 | TanStack Query |
| 8 | Feature: LoginForm UI 组件 | dev | 单测通过 | React Hook Form + Zod |
| 9 | Feature: RegisterForm UI 组件 | dev | 单测通过 | React Hook Form + Zod |
| 10 | App: /login 页面 | dev | 单测通过 | Next.js page |
| 11 | App: /register 页面 | dev | 单测通过 | Next.js page |
| 12 | Feature: Login/Register 测试 | dev | 单测通过 | Store tests |
| 13 | Widget/Feature: RTL 组件测试 | dev | 待办 | Testing Library (optional) |
| 14 | 全量验证 (tsc + vitest + biome + entropy) | dev | 单测通过 | 四项检查 |
| 15 | QA: 测试用例设计 | qa | 完成 | test-case-design.md 已编写 |
| 16 | QA: 验收测试 + 代码审查 | qa | 完成 | test-report.md 已编写，验收通过 |

## 执行顺序

entities → shared/dto → shared/api → features/model → features/api → features/ui → app → 全量测试 → QA 验收

## 原子任务分解（每项 10–15 分钟，单会话可完成并 commit）

> **目的**：将上表「按层」的粗粒度任务拆到 10–15 分钟的原子级，便于 Ralph Loop 单轮执行完整交付、便于新会话恢复时定位进度。
>
> **要求**：每个原子任务必填 5 个字段 — `文件路径`、`骨架片段`、`验证命令`、`预期输出`、`commit 消息`。

---

### 1.1 Entity: Email 值对象

- **文件**: `src/entities/user/model/email.ts`
- **测试**: `src/entities/user/model/email.test.ts`
- **骨架**:
  ```typescript
  // email.test.ts — Red 阶段先写失败测试
  describe('Email', () => {
    it('should_create_email_when_format_valid', () => {
      const email = Email.create('user@example.com');
      expect(email.value).toBe('user@example.com');
    });

    it('should_throw_when_email_format_invalid', () => {
      expect(() => Email.create('invalid')).toThrow('Invalid email format');
    });

    it('should_equal_when_values_match', () => {
      const e1 = Email.create('a@b.com');
      const e2 = Email.create('a@b.com');
      expect(e1.equals(e2)).toBe(true);
    });
  });
  ```
- **验证命令**: `pnpm vitest run src/entities/user/model/email.test.ts`
- **预期输出**: `Tests: 3 passed, 0 failed`
- **commit**: `feat(entity): Email value object with validation`

---

### 1.2 Entity: AccessToken 值对象

- **文件**: `src/entities/user/model/accessToken.ts`
- **测试**: `src/entities/user/model/accessToken.test.ts`
- **骨架**:
  ```typescript
  // accessToken.test.ts
  describe('AccessToken', () => {
    it('should_create_token_when_input_valid', () => {...});
    it('should_be_expired_when_past_expiry', () => {...});
    it('should_be_valid_when_not_expired', () => {...});
  });
  ```
- **验证命令**: `pnpm vitest run src/entities/user/model/accessToken.test.ts`
- **预期输出**: `Tests: 3 passed, 0 failed`
- **commit**: `feat(entity): AccessToken value object with expiry check`

---

### 1.3 Entity: User 聚合根

- **文件**: `src/entities/user/model/user.ts`
- **测试**: `src/entities/user/model/user.test.ts`
- **骨架**:
  ```typescript
  // user.ts — 封装不变量
  export class User {
    readonly id: UserId;
    readonly email: Email;
    readonly nickname: string;
    readonly status: UserStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    static create(props: CreateUserProps): User {...}
    isActive(): boolean {...}
  }
  ```
- **验证命令**: `pnpm vitest run src/entities/user/model/user.test.ts`
- **预期输出**: `Tests: 5 passed, 0 failed` (create, isActive, immutability)
- **commit**: `feat(entity): User aggregate root with invariants`

---

### 1.4 Entity: UserId 值对象

- **文件**: `src/entities/user/model/userId.ts`
- **测试**: `src/entities/user/model/userId.test.ts`
- **骨架**:
  ```typescript
  export class UserId {
    readonly value: string;
    static create(id: string): UserId {
      if (!isValidUUID(id)) throw new Error('Invalid UUID');
      return new UserId(id);
    }
    static generate(): UserId {...}
  }
  ```
- **验证命令**: `pnpm vitest run src/entities/user/model/userId.test.ts`
- **预期输出**: `Tests: 2 passed, 0 failed`
- **commit**: `feat(entity): UserId value object`

---

### 2.1 Shared: Auth DTO Schemas

- **文件**: `src/shared/api/dto/auth.ts`
- **骨架**:
  ```typescript
  import { z } from 'zod';

  export const LoginCredentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(32),
  });

  export const RegisterSchema = z.object({...}).refine(...);

  export const AuthResponseSchema = z.object({...});
  ```
- **验证命令**: `pnpm tsc --noEmit src/shared/api/dto/auth.ts`
- **预期输出**: `error TS0: 0` (无错误)
- **commit**: `feat(shared): Auth DTO Zod schemas`

---

### 2.2 Shared: API Client Auth Interceptor

- **文件**: `src/shared/api/client.ts` (增强)
- **骨架**:
  ```typescript
  // 添加 token 注入和自动续期逻辑
  client.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token && !token.isExpired()) {
      config.headers.Authorization = `Bearer ${token.token}`;
    }
    return config;
  });
  ```
- **验证命令**: `pnpm tsc --noEmit src/shared/api/client.ts`
- **预期输出**: 无错误
- **commit**: `feat(shared): API client auth interceptor with auto-refresh`

---

### 3.1 Feature: Auth Zustand Store

- **文件**: `src/features/auth/model/store.ts`
- **测试**: `src/features/auth/model/store.test.ts`
- **骨架**:
  ```typescript
  import { create } from 'zustand';
  import { persist } from 'zustand/middleware';

  interface AuthState {
    user: User | null;
    accessToken: AccessToken | null;
    isAuthenticated: boolean;
    login: (user: User, token: AccessToken) => void;
    logout: () => void;
  }
  ```
- **验证命令**: `pnpm vitest run src/features/auth/model/store.test.ts`
- **预期输出**: `Tests: 4 passed, 0 failed`
- **commit**: `feat(auth): Zustand auth store with persist`

---

### 3.2 Feature: useLogin Mutation Hook

- **文件**: `src/features/auth/api/useLogin.ts`
- **测试**: `src/features/auth/api/useLogin.test.ts`
- **骨架**:
  ```typescript
  import { useMutation } from '@tanstack/react-query';

  export function useLogin() {
    return useMutation({
      mutationFn: async (credentials: LoginCredentials) => {
        const response = await apiClient.post('/api/v1/auth/login', credentials);
        return AuthResponseSchema.parse(response);
      },
    });
  }
  ```
- **验证命令**: `pnpm vitest run src/features/auth/api/useLogin.test.ts`
- **预期输出**: `Tests: 3 passed, 0 failed` (MSW mock)
- **commit**: `feat(auth): useLogin mutation hook with MSW tests`

---

### 3.3 Feature: useRegister Mutation Hook

- **文件**: `src/features/auth/api/useRegister.ts`
- **测试**: `src/features/auth/api/useRegister.test.ts`
- **验证命令**: `pnpm vitest run src/features/auth/api/useRegister.test.ts`
- **预期输出**: `Tests: 3 passed, 0 failed`
- **commit**: `feat(auth): useRegister mutation hook with MSW tests`

---

### 3.4 Feature: useLogout Hook

- **文件**: `src/features/auth/api/useLogout.ts`
- **骨架**: 调用 API + 清空 store
- **验证命令**: `pnpm vitest run src/features/auth/api/useLogout.test.ts`
- **commit**: `feat(auth): useLogout hook`

---

### 4.1 Feature: LoginForm UI 组件

- **文件**: `src/features/auth/ui/LoginForm.tsx`
- **测试**: `src/features/auth/ui/LoginForm.test.tsx`
- **骨架**:
  ```tsx
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';

  export function LoginForm({ onSubmit }: LoginFormProps) {
    const form = useForm({
      resolver: zodResolver(LoginCredentialsSchema),
    });
    // ...
  }
  ```
- **验证命令**: `pnpm vitest run src/features/auth/ui/LoginForm.test.tsx`
- **预期输出**: `Tests: 4 passed, 0 failed` (RTL 用户视角)
- **commit**: `feat(auth): LoginForm component with validation`

---

### 4.2 Feature: RegisterForm UI 组件

- **文件**: `src/features/auth/ui/RegisterForm.tsx`
- **测试**: `src/features/auth/ui/RegisterForm.test.tsx`
- **骨架**: 类似 LoginForm，多 confirmPassword 字段
- **验证命令**: `pnpm vitest run src/features/auth/ui/RegisterForm.test.tsx`
- **预期输出**: `Tests: 5 passed, 0 failed`
- **commit**: `feat(auth): RegisterForm component with confirm password`

---

### 5.1 App: /login Page

- **文件**: `src/app/login/page.tsx`
- **骨架**:
  ```tsx
  import { LoginForm } from '@/features/auth';

  export default function LoginPage() {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoginForm />
      </div>
    );
  }
  ```
- **验证命令**: `pnpm tsc --noEmit src/app/login/page.tsx`
- **预期输出**: 无错误
- **commit**: `feat(app): /login page`

---

### 5.2 App: /register Page

- **文件**: `src/app/register/page.tsx`
- **验证命令**: `pnpm tsc --noEmit src/app/register/page.tsx`
- **commit**: `feat(app): /register page`

---

### 6.1 Feature: Feature-level Integration Tests

- **文件**: `src/features/auth/api/*.test.ts` (MSW 集成)
- **验证命令**: `pnpm vitest run src/features/auth/`
- **预期输出**: 所有测试通过
- **commit**: `test(auth): Feature-level MSW integration tests`

---

### 7.1 Full Validation

- **验证命令**:
  ```bash
  pnpm tsc --noEmit
  pnpm vitest run
  pnpm biome check src tests
  ./scripts/entropy-check.sh
  ```
- **预期输出**:
  - `tsc`: 0 errors
  - `vitest`: All tests passed
  - `biome`: Checked X files, no fixes needed
  - `entropy-check`: 13/13 checks passed
- **commit**: `chore(auth): Pre-handoff validation`

---

## 开发完成记录

- 全量 `pnpm vitest run`: 29/29 用例通过
- 架构合规检查:
  - `pnpm exec depcruise src`: pass
  - FSD 依赖方向检查: pass
- 通知 @qa 时间: 2026-04-19

## QA 验收记录

- 全量测试（含 Playwright E2E）: 29 个 Vitest 测试通过，E2E 待后续补充
- 代码审查结果: 通过（FSD 合规，entities 纯净，TDD 证据验证通过）
- 代码风格检查: pass
- 问题清单: 详见 test-report.md（0 Critical/Major，4 Minor 建议）
- **最终状态**: 验收通过
