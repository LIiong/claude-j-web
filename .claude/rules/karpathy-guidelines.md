---
description: "四项心智原则（Karpathy）：想清楚再写 / 简洁优先 / 外科式变更 / 目标驱动执行。所有角色、所有阶段通用。"
globs:
  - "**/*"
alwaysApply: true
---

# 四项心智原则（Karpathy Guidelines）

> 源自 Andrej Karpathy 对 LLM 编码常见错误的观察（["The models make wrong assumptions on your behalf and just run along with them without checking."](https://x.com/karpathy/status/2015883857489522876)），本土化到 claude-j-web 的 Next.js + FSD 语境。
>
> **定位**：这是**心智原则**，不是检查项。它约束 *态度* 而不是 *流程*。
> 与「三条心智铁律」（TDD/VERIFICATION/DEBUG）的区别：铁律管"绝对不能越过的线"，原则管"面对选择时默认往哪偏"。
>
> **权衡**：这四条偏向谨慎、偏向少改。简单任务可按常识处理，但**复杂任务必须往这四条上靠**。

---

## ① 想清楚再写（Think Before Coding）

**不假设、不藏困惑、亮出权衡。**

写 `requirement-design.md` / 写代码 / 修 bug 之前：

- **显式声明假设**：需求里没说的字段、边界、异常路径——写下你的假设，不确定就问，不要"先按常见情况做"。
- **多种解法时全部列出**：别静默选一种。在 `requirement-design.md` 或 `dev-log.md` 列出 2–3 种方案 + 取舍理由，让 @architect/用户一起决策。
- **更简单的方案优先提**：即使已经在写复杂方案，发现更简单路径时**必须停下说出来**，不是闷头继续。
- **不懂就停**：搞不清的地方——*stop*、命名困惑、发问。不要装懂、不要"先写再说"。

**本土化触发点**：
- Spec 阶段 `requirement-design.md` 含「假设与待确认」章节（未明确项必须显式列出）。
- Build 阶段遇到需求歧义 → 更新 `dev-log.md`「待确认」段 → 向 @architect 升级，不得猜。
- `fix` 阶段不懂根因时 → 走 `systematic-debugging` Phase 1，不得"先改改试试"。

---

## ② 简洁优先（Simplicity First）

**能解决问题的最少代码。零投机。**

- **不加需求外的功能**：需求要"按金额筛选"，不要顺手加"按日期筛选"。
- **一次性代码不抽象**：只被一处调用的工具类 = 过早抽象。等第二处出现再说。
- **不要"灵活性 / 可配置性"**：用户没要就不要。参数化每多一层，心智成本翻倍。
- **不为不可能的场景写 try/catch**：entities 层抛 typed Error 就抛，别包一层"万一"。
- **200 行能做到 50 行，重写**。

**自问**：资深工程师会不会说"这写得太绕了"？会 → 重写。

**本土化触发点**：
- 新 slice 别照搬老 slice 全部文件——先问哪些是真的需要的（例如简单展示型 feature 可能不需要 store）。
- feature hook / use case 一函数一职责，别建 Orchestrator/Facade 抽象层（除非已有 3 个以上同类 hook）。
- API Response ↔ DTO (Zod) ↔ Entity ↔ UI Model 四层映射已由规则保证 — 不要再发明"视图模型 VM"之类的第五层。
- 测试命名 `should_xxx_when_yyy` 够用，别再写 BDD 风格 `Given...When...Then` 嵌套 describe。

**反模式信号**：
- 写了 `XxxFactory` / `XxxBuilder` / `XxxStrategy` 却只有 1 个实现 → 去掉
- 组件 props 超过 10 个、或 5+ 个布尔 flag → 考虑拆分/用 discriminated union
- 一个函数 > 40 行 或 一个文件 > 300 行 → 考虑拆，但别为拆而拆

---

## ③ 外科式变更（Surgical Changes）

**只动该动的。只清你自己制造的垃圾。**

编辑既有代码时：

- **别"顺手优化"相邻代码、注释、格式**。即使看着碍眼。
- **别重构没坏的东西**。看不惯的写法不是"坏"。
- **匹配既有风格**——哪怕你会换个写法。claude-j-web 的 `readonly` 字段 + 静态 `toDomain()` mapper 就是风格，不要在某个 slice 突然切成 class-transformer/io-ts。
- **发现无关死代码 → 口头提一下，不要删**。留给用户决定。

你的改动产生的孤儿：

- **YOUR 改动导致未使用的 import/变量/方法** → 删掉。
- **原本就存在的死代码** → 不要删，除非被要求。

**单行测试**：每一行改动，都能回答"为什么这行在我修改需求的范围内"？答不上来 → 回退。

**本土化触发点**：
- 修 `useOrderCheckout` 某个分支的 bug → 只改那个分支 + 对应测试。**别顺手** rename 其他 hook、**别顺手**调整 import 顺序、**别顺手**把 `useState` 切成 Zustand。
- `app/` 加一个新路由 → 不要趁机重构全局 `error.tsx` / `not-found.tsx`。
- `shared/api/` 加一个新端点 → 不要趁机改其他 slice 的 Zod schema。

**与 guard-agent-scope 的关系**：
- Hook 管"跨角色越权"（@dev 不能改 test-report.md）。
- 本条管"同角色内越权"（@dev 改 A slice 时不碰 B slice）。两层互补。

---

## ④ 目标驱动执行（Goal-Driven Execution）

**定可验证的成功标准。闭环到通过为止。**

把任务转成可验证目标：

| 弱目标（禁用） | 强目标（必需） |
|---|---|
| "加校验" | "写针对空/超长/非法字符的测试，先红再绿" |
| "修 bug" | "写复现测试用例，先红，修后绿" |
| "重构 X" | "改之前 pnpm vitest run 全绿，改之后 pnpm vitest run 仍全绿" |
| "优化性能" | "基线跑 X ms，目标 < Y ms，用 Lighthouse / React Profiler 测量" |

**多步任务先给计划**：
```
1. 写 entities 值对象 / 聚合 + 纯 Vitest 测试 → verify: pnpm vitest run src/entities
2. 写 shared/api DTO + Zod schema + mapper 单测 → verify: pnpm vitest run src/shared/api
3. 写 features/model hook / store + MSW 单测 → verify: pnpm vitest run src/features
4. 写 features/ui + widgets 组件 + RTL 测试 → verify: pnpm vitest run src/features src/widgets
5. 四项预飞 → verify: pnpm tsc --noEmit && pnpm vitest run && pnpm biome check src tests && ./scripts/entropy-check.sh 全过
```

**本土化触发点**：
- `requirement-design.md` 的「验收条件」必须可逐条转成 `should_xxx_when_yyy` 测试（@architect checklist 已纳入）。
- `task-plan.md` 原子任务必须含「验证命令 + 预期输出」（模板 P1-④ 已强制）。
- 强目标 → 强到 @dev 可以独立闭环；弱目标 → 每步都要回头问人。

---

## 有效性信号（自检）

这四条生效时你会看到：

- diff 更窄：只剩需求直接关联的行。
- 复写次数减少：不会"先做复杂版再简化"。
- **提问发生在动手前**，而不是犯错后。
- `dev-log.md` 的「与原设计变更」章节空或很短。
- @architect changes-requested 次数下降。

反过来：

- diff 里出现"顺手格式化"→ 违反 ③。
- 代码里出现 `XxxStrategy`/`XxxFactory` 但只有一个实现 → 违反 ②。
- 需求验收条件是"工作正常"/"性能可以" → 违反 ④。
- `dev-log.md` 写"我假设 X 是 Y" 但 Spec 阶段未提 → 违反 ①。

---

## 与已有约束的关系

| 约束来源 | 作用面 |
|---|---|
| 三条心智铁律（TDD/VERIFICATION/DEBUG） | 绝对红线，越过即作废 |
| 本规则（四项原则） | 默认方向，面对选择时偏哪边 |
| `ts-dev.md` / `ts-test.md` | TS/FSD 语法与分层约束 |
| `architecture.md` / `entropy-guard.md` | FSD 边界与熵防御 |
| `agent-collaboration.md` | 多 Agent 写作域 |

四者层级不同：铁律 > 规则 > 标准 > 原则。但**原则没有例外场景**——所有任务都先往这四条上靠。

---

> License attribution：Karpathy Guidelines 原文 MIT License，源自 `forrestchang/andrej-karpathy-skills`。本地化版本遵循同 License。
