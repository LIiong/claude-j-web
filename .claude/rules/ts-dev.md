# TypeScript 开发规则（FSD / Next.js）

## 适用范围
- **生效时机**：编辑 `*.ts`、`*.tsx`、`biome.json`、`.dependency-cruiser.cjs`、`tsconfig*.json` 时自动注入。
- **目标**：确保代码符合 Feature-Sliced Design + TS 严格模式 + 对象边界。

## MUST（强制）

### 分层与依赖（FSD）
- 依赖方向必须自上而下：`app/ → widgets/ → features/ → entities/ ← shared/`。
- `entities/` 必须保持纯 TS，**不得**依赖 `react` / `next` / `zustand` / `@tanstack/react-query`。
- `shared/api/` 是唯一允许出现 `fetch(` / `axios` 的位置。
- 同层 slice 之间禁止直接 import（如 `features/auth-login` 不得 import `features/user-profile`）；跨 slice 复用请下沉到 `entities/` 或 `shared/`。

### TS 严格性
- `tsconfig.json` 必须开启 `strict: true` + `noUncheckedIndexedAccess: true`。
- 禁止裸 `// @ts-ignore`；必须用 `// @ts-expect-error: 原因说明`。
- 禁止在生产代码使用 `any`（测试代码可接受）。优先 `unknown` + 类型收窄。

### 领域建模与对象边界
- `entities/` 聚合根封装业务不变量，状态变更通过命名方法（禁 public setter）。
- 值对象（value object）必须不可变（`readonly` 字段 + 工厂方法）。
- 转换链：`API Response ↔ DTO（Zod schema）↔ Domain Entity ↔ UI View`。
- `shared/api/` 返回 DTO，不返回 Entity；Entity 由 `features/` 层通过 mapper 构造。

### 导出风格
- `entities/`、`features/`、`widgets/` 禁用 `export default`；强制命名导出（便于 rename 追踪、IDE 友好）。
- 每个 slice 必须有 `index.ts` 作为 public API 边界。外部只能从 slice 根 import，不得深入子目录。

### 目录约定
- 路径别名：`@/*` → `src/*`（tsconfig `paths` 配置）。
- Slice 内部结构：
  ```
  features/<slice>/
    ├── ui/          # React 组件
    ├── model/       # hook / store / 状态逻辑
    ├── api/         # 调用 shared/api 的用例
    └── index.ts     # public API
  ```

## MUST NOT（禁止）
- 禁止 `entities/` 出现 `import X from 'react' | 'next/*' | 'zustand' | '@tanstack/*'`。
- 禁止 `shared/` 出现 `from '@/(entities|features|widgets|app)/...'`（反向依赖）。
- 禁止跨 slice 直接 import（`features/a` 不得 `from '@/features/b/*'`）。
- 禁止 `src/entities/**` 下使用 `export default`。
- 禁止裸 `// @ts-ignore`。
- 禁止在 `entities/` 或 `features/model/` 外使用 `useState` 管理领域状态（领域状态归 entity 方法 / Zustand store）。

## 执行检查（每次改动后）
1. 按顺序实现：entities → features → widgets → app。
2. `pnpm tsc --noEmit` 通过。
3. `pnpm biome check src tests` 通过。
4. `pnpm vitest run` 通过。
5. `./scripts/entropy-check.sh` 通过（13 项）。
