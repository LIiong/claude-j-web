/**
 * Shared HTTP client — 所有后端调用的唯一出口。
 *
 * 真实项目里这里会：
 *   1. 从 generated/schema.d.ts 拿到 paths 类型；
 *   2. 用 openapi-fetch 创建类型安全的 client；
 *   3. 注入 auth token、错误映射、retry 策略。
 *
 * 当前为占位版本（待 OpenAPI schema 生成后替换）。
 */
export interface FetchOptions {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly body?: unknown;
  readonly signal?: AbortSignal;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const res = await fetch(path, {
    method: options.method ?? 'GET',
    headers: { 'content-type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} @ ${path}`);
  }
  return (await res.json()) as T;
}
