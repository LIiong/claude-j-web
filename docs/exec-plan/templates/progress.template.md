# 任务进度

> Ralph Loop 核心状态文件。每次迭代后 Agent 必须更新此文件。
> 下次迭代的全新 Agent 会话通过读取此文件恢复上下文。

## 当前状态
- 阶段：{dev-spec | architect-review | dev-build | qa-verify | shipped}
- 当前迭代：{N}
- 最后更新：{YYYY-MM-DDTHH:MM:SS}

## 任务清单

> 使用 checkbox 格式。完成后标记 [x] 并附 commit hash。
> ralph-loop.sh 通过读取第一个 [ ] 项确定下一个任务。

- [x] 1. entities：定义聚合根（示例，commit abc1234）
- [ ] 2. entities：定义值对象 ← 当前
- [ ] 3. shared/api：Zod DTO + fetch 封装
- [ ] 4. features/{slice}/model：store / hook / mapper
- [ ] 5. features/{slice}/api：mutation / query + MSW 测试
- [ ] 6. features/{slice}/ui：组件 + RTL 测试
- [ ] 7. widgets（如需）：页面级组合
- [ ] 8. app/{route}/page.tsx：装配
- [ ] 9. 各层测试补齐
- [ ] 10. 验证：tsc + vitest + biome + entropy-check
- [ ] 11. （ui-surface=true）UI-SPEC.md + ui-verification-report.md

## 迭代日志

> 每次迭代结束时追加一条记录。
> 下次迭代的 Agent 通过此日志了解之前发生了什么。

### 迭代 1 ({timestamp})
- 完成：{完成的任务编号}
- 遇到问题：{问题描述，无则写"无"}
- 下次应做：{建议下次迭代处理的任务}
