import '@testing-library/jest-dom/vitest';

// USE_MOCK=1 时启用 MSW；默认关闭（feature 测试显式 import registerMswLifecycle 后由 slice 自己挂）。
// 当后端不可达且未显式设置 USE_MOCK 时，建议开发者手动 `export USE_MOCK=1` 再跑测试。
if (process.env.USE_MOCK === '1') {
  const { registerMswLifecycle } = await import('./msw/server');
  registerMswLifecycle();
}
