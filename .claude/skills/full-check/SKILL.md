---
name: full-check
description: "运行四项完整验证：tsc + vitest + biome + entropy-check，输出汇总报告。"
user-invocable: true
disable-model-invocation: true
allowed-tools: "Bash(pnpm *) Bash(./scripts/*) Bash(./.claude/skills/full-check/scripts/*) Read"
---

# 四项完整验证

运行项目的四项核心质量检查，输出通过/失败汇总。
这是 @dev 交接 @qa 前和 @qa 独立验收时的必检项目。

**脚本位置**：本 skill 自带 `scripts/entropy-check.sh` 与 `scripts/quick-check.sh`。`scripts/` 下的同名文件为指向本目录的符号链接（向后兼容）。

## 执行步骤

### 1. TypeScript 类型检查
```bash
pnpm tsc --noEmit
```
**检查要点**：strict 模式 + `noUncheckedIndexedAccess` 下零类型错误。

### 2. 单元 + 组件测试
```bash
pnpm vitest run
```
**检查要点**：
- entities / features / widgets 各层测试全通过
- 命名 `should_xxx_when_yyy` 规范
- 测试金字塔各层覆盖

### 3. 代码风格 + lint
```bash
pnpm biome check src tests
```
**检查要点**：import 顺序、未用变量、格式化、命名。

### 4. 熵检查（架构漂移检测）
```bash
./scripts/entropy-check.sh
# 或等价的规范路径：
# ./.claude/skills/full-check/scripts/entropy-check.sh
```
**检查要点**：13 项：FSD 依赖方向、entities 纯净性、跨 slice import、shared 反向依赖、fetch 外溢、裸 @ts-ignore、export default 违规、测试命名、ADR 一致性、知识库一致性、过期任务、聚合列表同步、死代码。

## 输出汇总

四项检查完成后，输出如下格式的汇总：

```
┌──────────────────────────────────────┐
│         四项验证结果汇总              │
├──────────────┬───────────────────────┤
│ tsc          │ ✅ PASS / ❌ FAIL     │
│ vitest       │ ✅ PASS / ❌ FAIL     │
│ biome        │ ✅ PASS / ❌ FAIL     │
│ entropy-check│ ✅ PASS / ❌ FAIL     │
├──────────────┴───────────────────────┤
│ 总结：X/4 通过                       │
└──────────────────────────────────────┘
```

如有失败项，在汇总下方列出具体失败原因和修复建议。
