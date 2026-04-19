import type { HttpHandler } from 'msw';

/**
 * 全局 MSW handlers 基线 —— 默认为空。
 *
 * 每个 feature slice 在 `src/features/<slice>/api/__msw__/handlers.ts`
 * 导出本 slice 的 handlers，并在 slice 测试 setup 里通过 `server.use(...)`
 * 叠加进来。避免中心化大包袱。
 *
 * 仅当全局需要一个兜底 handler（例如 /actuator/health 或 401 token-refresh）
 * 时才往本数组加，且必须在 PR 描述中说明。
 */
export const defaultHandlers: HttpHandler[] = [];
