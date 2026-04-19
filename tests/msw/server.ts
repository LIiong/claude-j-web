import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { defaultHandlers } from './handlers/default';

export const server = setupServer(...defaultHandlers);

/**
 * 在 vitest 生命周期上注册 MSW server。
 *
 * 本函数由 `tests/setup.ts` 条件调用（仅当 USE_MOCK=1 或后端不可达时）。
 * feature slice 测试可通过 `import { server } from '@/../tests/msw/server'`
 * 在 `beforeEach` 中 `server.use(...slice handlers)` 叠加自己的 handler。
 */
export function registerMswLifecycle(): void {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
}
