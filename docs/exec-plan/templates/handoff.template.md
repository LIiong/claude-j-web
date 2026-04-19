---
task-id: "{task-id}"
from: dev
to: architect
status: pending-review
timestamp: "{YYYY-MM-DDTHH:MM:SS}"
task-type: frontend              # backend-only | frontend | full-stack
ui-surface: true                 # 是否产出可见 UI；false 时整套 UI 流程自动跳过
ui-review-score: pending         # Verify 阶段由 @qa 填写（如 4.2/5）；ui-surface=false 写 N/A
backend-sync:
  schema-sha: pending            # api-sync.sh 产出的 sha256 前 12 位；任务无后端调用则 N/A
  sync-mode: pending             # real | mock | n/a —— Spec/Build 阶段决定；Verify 必须切 real 重验
  backend-probe: pending         # reachable | unreachable | n/a —— backend-probe.sh 结果，60 秒内有效
pre-flight:
  tsc: pending                 # 填真实输出，如: pass # pnpm tsc --noEmit exit 0
  vitest: pending              # 填真实输出，如: pass # Tests: 50 passed, 0 failed
  biome: pending               # 填真实输出，如: pass # checked 47 files, no fixes needed
  entropy-check: pending       # 填真实输出，如: pass # 13/13 checks passed
  tdd-evidence:                # 🔴 强制：每个生产类/关键模块都要有红绿两个 commit hash
    - class: "{ClassName}"
      red-commit: "{hash7}"    # test(xxx): add failing test (Red)
      green-commit: "{hash7}"  # feat(xxx): implement to pass (Green)
artifacts:
  - requirement-design.md
  - task-plan.md
summary: ""
---

# 交接文档

> 每次 Agent 间交接时更新此文件。
> 状态流转：pending-review → approved / changes-requested

## 交接说明
{发送方填写：本次交接的内容摘要、需要关注的重点、已知风险}

## 评审回复
{接收方填写：评审意见、问题清单、通过/待修改结论}

---

## 交接历史

### {日期} — @dev → @architect
- 状态：pending-review
- 说明：{设计评审请求}

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
