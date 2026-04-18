import type { ReactNode } from 'react';

export const metadata = {
  title: 'claude-j-web',
  description: 'claude-j 企业级前端 — Next.js 15 + TypeScript + FSD',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
