# Bug 记录

## BUG-001（已解决）

- 现象：首次运行 lint 时，TypeScript 7 与当前 typescript-eslint 不兼容；降级到 TypeScript 6 后又出现 React effect 规则错误。
- 复现：使用 TypeScript 7 执行 `pnpm lint`；再用 TypeScript 6 检查 `theme-toggle.tsx`。
- 根因：依赖生态尚未支持 TypeScript 7；主题初始化在 effect 中同步 setState。
- 修复：锁定 TypeScript 6.0.3；主题状态更新放入 requestAnimationFrame，并补充清理回调。
- 回归测试：`pnpm lint`、`pnpm typecheck` 均通过。
- 状态：已关闭。

## BUG-002（已解决）

- 现象：根目录 Vitest 无法解析 workspace 包名。
- 根因：测试运行器没有读取 pnpm workspace 的 package exports。
- 修复：在 `vitest.config.ts` 增加源码路径别名。
- 回归测试：`pnpm test` 三个测试文件、五个断言全部通过。
- 状态：已关闭。
