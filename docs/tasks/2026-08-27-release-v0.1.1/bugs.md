# Bug 记录

## REL-001：版本变化后本地 pnpm 拒绝刷新依赖状态

- 现象：并行运行 Lint 和 TypeScript 时，pnpm 报告非交互环境无法确认重建 `node_modules`。
- 复现：修改工作区包版本后直接运行 `turbo run lint`。
- 根因：pnpm 检测到工作区 package 状态变化，需要刷新本地依赖元数据。
- 修复：设置 `CI=true`，执行 `pnpm install --offline --frozen-lockfile`；未更新锁文件或依赖版本。
- 回归：Lint、TypeScript 和完整静态构建通过。
- 状态：已解决。
