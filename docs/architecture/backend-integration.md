# 后端联调工作流（claude-j-web ↔ claude-j 后端）

本文档是前端 agent 与 Java/Spring Boot 后端联调的**唯一操作手册**。

## 1. 设计原则

- **契约先行**：所有前端 `/api/**` 调用的类型都来自后端 `/v3/api-docs` 生成的 `schema.d.ts`，不手写 DTO
- **指纹追踪**：`.schema.sha256` 提交入库，agent 通过 sha 对比检测契约漂移
- **离线可开发，验收必真后端**：后端不可达时降级 MSW mock 继续 Build；@qa Verify 阶段强制切真后端
- **机械可判定**：所有联调门用脚本退出码驱动，避免"应该通过"类主观判断

## 2. 关键产物

### 2.1 `src/shared/api/generated/` 目录结构

| 文件 | 来源 | 追踪状态 | 语义 |
|------|------|---------|------|
| `schema.d.ts` | `openapi-typescript` 生成 | `.gitignore` | OpenAPI → TS 类型定义，给 `openapi-fetch` 用 |
| `.schema.sha256` | `api-sync.sh` 写入 | **tracked** | 当前后端 schema JSON 的 sha256；agent 通过 diff 判漂移 |
| `.schema.meta.json` | `api-sync.sh` 写入 | **tracked** | 时间戳 / 来源 URL / 后端 git SHA / 上次 sha；供 QA 证据链 |
| `.gitkeep` | 手工 | tracked | 目录占位（gitignored 目录的保留开关） |

### 2.2 `.schema.meta.json` 字段示例

```json
{
  "schema_sha256": "abc123...",
  "schema_sha_short": "abc123456789",
  "source_url": "http://localhost:8080/v3/api-docs",
  "synced_at": "2026-04-19T07:00:00Z",
  "backend_git_sha": "e5f6a7b",
  "previous_sha256": "def456..."
}
```

- `backend_git_sha` 依赖后端暴露 `/actuator/info`（Spring Boot Actuator + git.properties）；若未配则空字符串，不阻断

## 3. 脚本矩阵

| 脚本 | 退出码 | 用途 |
|------|-------|------|
| `scripts/backend-probe.sh` | 0=可达 / 1=不可达 / 2=curl 缺失 | 快速 2 秒探测；被其他脚本复用 |
| `scripts/api-sync.sh` | 0=同步 OK / 10=后端不可达 / 20=schema 漂移（仅 --check-drift）/ 30=生成失败 | 完整同步：probe → 拉 JSON → 算 sha → 生成 TS → 写 meta |
| `scripts/api-sync.sh --check-drift` | 0=一致 / 20=漂移 | 只对比 sha，不改文件；@qa Verify 用 |
| `scripts/hooks/guard-api-sync.sh` | 0=放行 / 2=阻断 | PreToolUse Hook：写 `src/features/*/api/**` 或 `src/shared/api/client.ts` 时检查 schema 新鲜度 |

## 4. MSW 组织约定

### 4.1 基线
- `tests/msw/server.ts` — `setupServer(...defaultHandlers)` + `registerMswLifecycle()`
- `tests/msw/handlers/default.ts` — 全局 handlers 空数组（除非全局需要兜底，例如 `/actuator/health`）
- `tests/setup.ts` — 当 `USE_MOCK=1` 时自动挂 MSW 生命周期

### 4.2 slice 扩展模式
每个 feature slice 自带 handlers：

```ts
// src/features/<slice>/api/__msw__/handlers.ts
import { http, HttpResponse } from 'msw';

export const sliceHandlers = [
  http.post('/api/v1/auth/login', () => HttpResponse.json({ accessToken: 'mock', refreshToken: 'mock' })),
];
```

测试中叠加：

```ts
import { server } from '../../../../tests/msw/server';
import { sliceHandlers } from './__msw__/handlers';

beforeEach(() => { server.use(...sliceHandlers); });
```

### 4.3 切换模式
| 命令 | 模式 | 用途 |
|------|------|------|
| `pnpm vitest run` | real | 打真后端（需 localhost:8080 可达） |
| `USE_MOCK=1 pnpm vitest run` | mock | 全部走 MSW；@dev 离线开发 |
| `BACKEND_URL=http://host:8080 pnpm vitest run` | real-remote | 打非本地后端 |

## 5. agent 联调门速查

```
@dev Spec
  ├─ 涉及 /api/** → api-sync.sh → 填 handoff.backend-sync.{schema-sha,sync-mode,backend-probe}
  ├─ 不涉及 → 三字段 n/a
  └─ 退出 10（离线）→ sync-mode: mock，Verify 阶段必须切 real 重验

@dev Build
  ├─ 写测试时默认 MSW（USE_MOCK=1）
  ├─ 收尾跑 backend-probe.sh
  │   ├─ 0 → 再跑一次 pnpm vitest run（real mode）
  │   └─ 1 → 保持 mock，dev-log 记录"真后端待 QA 补验"
  └─ 四项预飞全过

@qa Verify
  ├─ backend-probe.sh
  │   ├─ 0 → 继续
  │   └─ 1 → ❌ 阻断，handoff changes-requested to: ralph
  ├─ api-sync.sh --check-drift
  │   ├─ 0 → 继续
  │   └─ 20 → ❌ 阻断，handoff changes-requested to: dev 附 diff
  ├─ 不带 USE_MOCK 跑 pnpm vitest run src/features
  ├─ Playwright E2E 指向真后端
  └─ test-report「后端联调证据」章节记录
```

## 6. 故障排查表

| 症状 | 可能根因 | 定位路径 |
|------|---------|---------|
| `api-sync.sh` 退出 10 | 后端未启动 / 端口不通 / `NEXT_PUBLIC_API_BASE_URL` 指错 | 1. `curl -v http://localhost:8080/v3/api-docs` 2. `echo $NEXT_PUBLIC_API_BASE_URL` 3. 检查后端进程 |
| 生成 `schema.d.ts` 但运行时 fetch 失败 | CORS / next rewrites 缺失 / 开发环境代理问题 | 检查 `next.config.*` 是否需加 rewrites；检查后端 CORS 白名单含 `http://localhost:3000` |
| Verify 阶段 401 但 mock 阶段 OK | Bearer token 未注入 / localStorage 未清理 / 后端校验更严 | 检查 `src/shared/api/client.ts` 的 `apiFetch()` token 读取；清 localStorage 重试；抓包看 `Authorization` header |
| `api-sync.sh --check-drift` 退出 20 | 后端在 Spec 后改了端点 | `git log --oneline` 看后端 git SHA；让后端同学给出变更清单；回 @dev 基于新 schema 重做 requirement-design |
| `guard-api-sync.sh` 阻断但刚跑过 sync | 新 session 缺 `.claude/.api-sync-session` / sha 文件 mtime 老旧 | 再跑 `./scripts/api-sync.sh` 重置 session 标记 |
| real-mode vitest 全炸 mock-mode 全过 | DTO 字段名 / 类型与 mock handler 不符 | `diff` 真响应与 handler 返回；优先改 handler 让 mock 逼近 real，而非迁就 mock |

## 7. 与后端团队的反馈回路

本版本**不做自动化跨仓通信**。漂移 / 缺口 / 冲突处理：

1. @dev 发现契约不满足需求 → 在 `dev-log.md` 记"契约缺口"章节，列出期望字段 / 端点
2. 升级到用户 → 用户与后端同学沟通（Slack / issue / 当面）
3. 后端更新并发布 → 前端重跑 `./scripts/api-sync.sh` → 基于新 schema 继续

未来扩展位：生成 `docs/exec-plan/active/<task-id>/contract-change-request.md` 模板，自动 `gh issue create` 到后端仓库（本轮不做）。

## 8. 风险与约束

- **`backend_git_sha` 可能为空**：后端未暴露 `/actuator/info` 或未配 `git.properties` 时字段留空，不影响退出码
- **Hook 的 7 天新鲜度**：偏保守，活跃开发期本 session 标记即可放行；低活跃可能误报，手动 `./scripts/api-sync.sh` 重置
- **强制 real verify 会让后端宕机时任务挂起**：设计上故意——mock-only 放行会掩盖契约漂移。紧急放行靠人工批准（本版本无脚本支持）
- **MSW handlers 分散维护**：每 slice 自持；若后期重复率高再抽 `src/shared/api/__msw__/common.ts`
