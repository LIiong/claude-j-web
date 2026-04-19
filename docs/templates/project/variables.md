# 项目变量定义

本文档集中定义移植时需要替换的所有占位变量。模板文件（本目录下 `*.template.md`）中使用 `${VARIABLE_NAME}` 语法引用这些变量。

---

## 使用方法

### 方法 A：手动替换
直接用编辑器的"查找替换"功能将模板中的 `${VARIABLE_NAME}` 替换为实际值。

### 方法 B：脚本替换
```bash
./scripts/bootstrap-project.sh \
  --project-name "my-app" \
  --description "My new FSD project"
```

### 方法 C：envsubst
```bash
export PROJECT_NAME=my-app
# ... 其他变量
envsubst < CLAUDE.template.md > CLAUDE.md
```

---

## 变量定义

### 项目身份
| 变量名 | 默认值 | 说明 |
|-------|--------|------|
| `PROJECT_NAME` | `example-web` | 项目名（kebab-case），用于目录、包名 |
| `PROJECT_DESCRIPTION` | `示例 FSD 前端项目` | 一句话项目描述 |
| `PROJECT_OWNER` | `team-name` | 团队/所有者名称 |

### 技术栈
| 变量名 | 默认值 | 说明 |
|-------|--------|------|
| `LANGUAGE` | `TypeScript` | 主要编程语言 |
| `LANGUAGE_VERSION` | `TypeScript 5.6` | 语言版本 |
| `FRAMEWORK` | `Next.js 15 (App Router + RSC)` | 主框架 + 版本 |
| `BUILD_TOOL` | `pnpm 9` | 包管理 / 构建工具 |
| `STATE_MGMT` | `Zustand + TanStack Query v5` | 状态管理 |
| `SCHEMA_TOOL` | `Zod` | 运行时 schema / 表单验证 |
| `TEST_FRAMEWORK` | `Vitest + RTL + MSW + Playwright` | 测试栈 |
| `STYLE_TOOL` | `Tailwind CSS 4 + shadcn/ui` | 样式 / 组件库 |
| `LINT_TOOL` | `Biome` | lint + 格式化 |

### 目录结构（FSD 分层）
| 变量名 | 默认值 | 说明 |
|-------|--------|------|
| `PATH_ALIAS` | `@/*` → `src/*` | 路径别名 |
| `LAYER_APP` | `src/app/` | Next.js App Router 入口 |
| `LAYER_WIDGETS` | `src/widgets/` | 页面级组合 |
| `LAYER_FEATURES` | `src/features/` | 单一用户场景 |
| `LAYER_ENTITIES` | `src/entities/` | 纯 TS 业务模型 |
| `LAYER_SHARED` | `src/shared/` | 基础层（ui / api / lib / config） |

### 构建命令
| 变量名 | 默认值（pnpm） | 其他栈示例 |
|-------|----------------|-----------|
| `CMD_BUILD_ALL` | `pnpm build` | `npm run build` / `yarn build` |
| `CMD_RUN_TESTS` | `pnpm vitest run` | `pnpm jest` / `npm test` |
| `CMD_RUN_DEV` | `pnpm dev` | `npm run dev` / `yarn dev` |
| `CMD_TYPE_CHECK` | `pnpm tsc --noEmit` | `npx tsc --noEmit` |
| `CMD_STYLE_CHECK` | `pnpm biome check src tests` | `pnpm lint` / `eslint src` |
| `CMD_ARCH_CHECK` | `pnpm exec depcruise src` | 自定义脚本 |
| `CMD_E2E` | `pnpm playwright test` | `pnpm cypress run` |
| `CMD_QUICK_CHECK` | `./scripts/quick-check.sh` | 同名脚本适配 |
| `CMD_ENTROPY_CHECK` | `./scripts/entropy-check.sh` | 同名脚本适配 |

### 架构量化
| 变量名 | 默认值 | 说明 |
|-------|--------|------|
| `DEPCRUISE_RULE_COUNT` | `8` | dependency-cruiser 规则数（参考值） |
| `ENTROPY_CHECK_COUNT` | `13` | 熵扫描检查项数 |

### 命名约定
| 变量名 | 默认值 | 说明 |
|-------|--------|------|
| `FILE_CASE` | `kebab-case`（非组件） / `PascalCase`（React 组件） | 文件命名 |
| `COMPONENT_CASE` | `PascalCase` | React 组件 |
| `HOOK_CASE` | `use` + `camelCase` | Hook 命名 |
| `EXPORT_STYLE` | 命名导出优先（entities/features/widgets 强制） | 导出风格 |
| `TEST_NAMING_PATTERN` | `should_{行为}_when_{条件}` | 测试命名规范 |

---

## 变量校验

在脚手架运行后，可运行以下命令验证是否还有未替换的占位符：
```bash
grep -rn '\${[A-Z_]*}' CLAUDE.md docs/ .claude/ scripts/ 2>/dev/null | grep -v '.template.md'
```
若输出非空，说明存在未替换变量。
