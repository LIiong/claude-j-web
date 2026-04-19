/**
 * dependency-cruiser 配置 —— FSD 依赖规则（L2 架构守护）
 *
 * 规则组织方式参考 Feature-Sliced Design 依赖方向与 slice 边界。
 */
module.exports = {
  forbidden: [
    /* ---------- FSD 依赖方向 ---------- */
    {
      name: 'fsd-entities-pure',
      severity: 'error',
      comment: 'entities/ 必须纯 TS：禁 react/next/zustand/@tanstack/react-query',
      from: { path: '^src/entities/' },
      to: { path: '^(react|next|zustand|@tanstack/react-query)($|/)' },
    },
    {
      name: 'fsd-entities-no-upper',
      severity: 'error',
      comment: 'entities/ 不得导入上层（features/widgets/app）',
      from: { path: '^src/entities/' },
      to: { path: '^src/(features|widgets|app)/' },
    },
    {
      name: 'fsd-features-no-upper',
      severity: 'error',
      from: { path: '^src/features/' },
      to: { path: '^src/(widgets|app)/' },
    },
    {
      name: 'fsd-widgets-no-upper',
      severity: 'error',
      from: { path: '^src/widgets/' },
      to: { path: '^src/app/' },
    },
    {
      name: 'fsd-shared-no-business',
      severity: 'error',
      comment: 'shared/ 是基础层，不得反向依赖业务层',
      from: { path: '^src/shared/' },
      to: { path: '^src/(entities|features|widgets|app)/' },
    },

    /* ---------- 跨 slice 禁止 ---------- */
    {
      name: 'no-cross-slice-features',
      severity: 'error',
      comment: 'features 之间不得直接 import（下沉到 entities/shared）',
      from: { path: '^src/features/([^/]+)/' },
      to: { path: '^src/features/(?!\\1/)[^/]+/' },
    },
    {
      name: 'no-cross-slice-entities',
      severity: 'error',
      from: { path: '^src/entities/([^/]+)/' },
      to: { path: '^src/entities/(?!\\1/)[^/]+/' },
    },
    {
      name: 'no-cross-slice-widgets',
      severity: 'error',
      from: { path: '^src/widgets/([^/]+)/' },
      to: { path: '^src/widgets/(?!\\1/)[^/]+/' },
    },

    /* ---------- 通用健康规则 ---------- */
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$',
          '\\.d\\.ts$',
          'src/app/',
        ],
      },
      to: {},
    },
    {
      name: 'not-to-deprecated',
      severity: 'error',
      from: {},
      to: { dependencyTypes: ['deprecated'] },
    },
    {
      name: 'no-duplicate-dep-types',
      severity: 'warn',
      from: {},
      to: { moreThanOneDependencyType: true, dependencyTypesNot: ['type-only'] },
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'no-non-package-json',
      severity: 'error',
      from: {},
      to: { dependencyTypes: ['npm-no-pkg', 'npm-unknown'] },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: { collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)' },
    },
  },
};
