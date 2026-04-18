/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // 编译时强制类型检查（build 失败阻断）；开发时由 IDE + tsc --noEmit 快速反馈
    ignoreBuildErrors: false,
  },
  eslint: {
    // Biome 负责 lint，关闭 ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
