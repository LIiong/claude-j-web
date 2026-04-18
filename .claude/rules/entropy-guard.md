---
description: "三层守护与熵管理：交付前必须通过 tsc、vitest、biome、depcruise、entropy-check。操作 TS 源码与交付脚本时生效。"
globs:
  - "**/*.ts"
  - "**/*.tsx"
  - "scripts/**/*.sh"
  - "scripts/hooks/**"
  - ".dependency-cruiser.cjs"
  - "biome.json"
alwaysApply: false
---

# 熵管理规则

## 适用范围
- **生效时机**：编辑 TS 源码或交付/守护脚本时自动注入。
- **目标**：防止架构漂移，保证规则在 Hook、架构测试、全局扫描三层一致生效。

## 纵深防御体系
| 层级 | 工具 | 触发时机 | 覆盖范围 |
|------|------|---------|---------|
| **L1** | `guard-ts-layer.sh` Hook | 每次 Edit/Write | FSD 依赖方向 / entities 纯净 / 跨 slice / TS 严格性 |
| **L2** | dependency-cruiser + Biome | `pnpm test` / `pnpm check` | 架构规则 + 测试命名 |
| **L3** | `entropy-check.sh`（13 项） | 交付前 / CI | 全局一致性扫描 |

三层覆盖关键项，任一失效时其他层兜底。

## MUST（强制）

### 三层守护必须保持开启
- L1：`guard-ts-layer.sh`（编辑阶段快速阻断）。
- L2：`pnpm exec depcruise src` + `pnpm biome check`（架构规则 + 风格）。
- L3：`./scripts/entropy-check.sh`（全局 13 项）。

### 交付前必须通过四项检查
1. `pnpm tsc --noEmit`（类型）
2. `pnpm vitest run`（测试）
3. `pnpm biome check src tests`（风格 + lint）
4. `./scripts/entropy-check.sh`（熵）

### FAIL 级问题必须立即修复
- entities 纯净性违规（框架依赖）
- FSD 依赖方向违规
- 跨 slice 直接 import
- fetch 外溢（出现在 shared/api 之外）
- 裸 @ts-ignore

## MUST NOT（禁止）
- 禁止跳过 `entropy-check.sh` 直接交接或合并。
- 禁止忽略 FAIL 级检查结果继续开发。
- 禁止仅修单层规则而不做三层同步（Hook / depcruise / entropy）。
- 禁止禁用或绕过守护 Hook（`guard-*.sh`）。

## 执行检查（每次改动后）
1. 开发中优先运行 `./scripts/quick-check.sh`（tsc + biome + vitest）做快速反馈。
2. 交接前完整运行四项检查并记录结果。
3. 若出现 WARN（any 用量、测试缺失、文件超长等），在本轮尽量清理并在交接中说明。
