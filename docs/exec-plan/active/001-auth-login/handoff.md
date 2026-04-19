---
task-id: "001-auth-login"
from: architect
to: dev
status: approved
timestamp: "2026-04-19T00:35:00Z"
pre-flight:
  tsc: pending            # pnpm tsc --noEmit exit 0
  vitest: pending         # pnpm vitest run - all passed
  biome: pending          # pnpm biome check src tests - no fixes needed
  entropy-check: pending  # ./scripts/entropy-check.sh - 13/13 checks passed
artifacts:
  - requirement-design.md
  - task-plan.md
summary: "用户登录注册功能：包含 User 实体、Email/AccessToken 值对象、Auth API DTOs、Zustand auth store、Login/Register Form 组件、/login 和 /register 页面"
---

# 交接文档

> 每次 Agent 间交接时更新此文件。
> 状态流转：pending-review → approved / changes-requested

## 交接说明

本次 Spec 阶段完成以下设计产出：

1. **领域模型设计**：
   - **User 实体**：封装用户核心信息（id, email, nickname, status），支持 `isActive()` 检查
   - **值对象**：Email（格式校验）、AccessToken（过期检查）、UserId（UUID）、UserStatus（枚举）
   - **约束**：entities/ 层纯 TypeScript，禁止 React/Next 依赖

2. **API 设计**：
   - 对接后端 `/api/v1/auth` 接口：login, register, refresh, logout
   - 使用 Zod schema 定义 DTOs：LoginCredentialsSchema, RegisterSchema, AuthResponseSchema

3. **状态管理**：
   - 服务器状态：TanStack Query v5 mutations (useLogin, useRegister, useLogout)
   - 客户端状态：Zustand auth store + persist 中间件持久化

4. **UI 组件**：
   - LoginForm / RegisterForm：React Hook Form + Zod resolver 表单校验
   - 校验规则：邮箱 RFC 5322、密码 8-32 位含大小写+数字、确认密码一致性

5. **测试策略**：
   - entities/：纯 Vitest 测试（值对象相等性、校验、不变量）
   - features/：Vitest + MSW 测试（mutation hooks、happy/异常路径）
   - UI：RTL 测试（用户视角表单交互）

6. **分层任务计划**：
   - 16 项任务按 entities → shared → features → app 分层拆解
   - 每个原子任务含验证命令和预期输出

**待确认事项**：
- 后端 `/api/v1/auth` 接口具体字段格式（待对接真实后端 OpenAPI schema）
- Token 存储策略：当前设计 localStorage，如需 HttpOnly cookie 需调整

**已知风险**：
- 若后端接口字段与假设不一致，DTO schema 需要调整

## 评审回复

**评审人**: @architect
**日期**: 2026-04-19
**结论**: 通过

### 关键确认项

- 架构合规: FSD 依赖方向正确，entities/ 层纯净
- 值对象设计: Email/AccessToken/UserId 均为不可变值对象
- 状态管理: TanStack Query + Zustand 分层合理
- 测试策略: 三层测试（entities Vitest / features MSW / UI RTL）覆盖完整
- 任务计划: 16 项原子任务，每项含验证命令+预期输出

### 设计风险

- Token 存储策略待确认（localStorage vs HttpOnly cookie）
- 后端 API 字段格式待对接真实 OpenAPI schema

**建议**: Build 阶段优先实现 entities/ 层，API DTO schema 可随后端对接调整

## 交接历史

### 2026-04-19 — @dev → @architect
- 状态：pending-review
- 说明：Spec 阶段完成，需求设计与任务计划已提交，请求架构评审

### {日期} — @architect → @dev
- 状态：approved / changes-requested
- 说明：{评审结论}

### {日期} — @dev → @qa
- 状态：pending-review
- Pre-flight：tsc: pass | vitest: pass | biome: pass | entropy-check: pass
- 说明：{验收请求}

### {日期} — @qa → (Ship)
- 状态：approved
- 说明：{验收通过，归档}
