import type { ReactNode } from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'claude-j-web',
  description: 'claude-j 企业级前端 — Next.js 15 + TypeScript + FSD',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
